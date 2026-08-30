var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/FplApiClient.ts
var FplUpstreamError = class extends Error {
  constructor(message, status, retryable, options) {
    super(message, options);
    this.status = status;
    this.retryable = retryable;
    this.name = "FplUpstreamError";
  }
  status;
  retryable;
  static {
    __name(this, "FplUpstreamError");
  }
};
var FplApiClient = class {
  static {
    __name(this, "FplApiClient");
  }
  baseUrl;
  timeoutMs;
  maxAttempts;
  fetcher;
  logger;
  constructor(options = {}) {
    this.baseUrl = options.baseUrl ?? "https://fantasy.premierleague.com/api";
    this.timeoutMs = options.timeoutMs ?? 1e4;
    this.maxAttempts = options.maxAttempts ?? 4;
    this.fetcher = options.fetcher ?? ((input, init) => fetch(input, init));
    this.logger = options.logger ?? console;
  }
  getBootstrap() {
    return this.get("/bootstrap-static/");
  }
  getFixtures(gameweek) {
    return this.get(`/fixtures/?event=${gameweek}`);
  }
  getEventLive(gameweek) {
    return this.get(`/event/${gameweek}/live/`);
  }
  getEntry(entryId) {
    return this.get(`/entry/${entryId}/`);
  }
  getEntryHistory(entryId) {
    return this.get(`/entry/${entryId}/history/`);
  }
  getEntryPicks(entryId, gameweek) {
    return this.get(`/entry/${entryId}/event/${gameweek}/picks/`);
  }
  getLeagueStandings(leagueId, page) {
    return this.get(`/leagues-classic/${leagueId}/standings/?page_standings=${page}`);
  }
  async get(path) {
    let lastError;
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await this.fetcher(`${this.baseUrl}${path}`, {
          headers: {
            Accept: "application/json",
            "User-Agent": "DC5-Fantasy-Hub-Worker/1.0"
          },
          signal: controller.signal
        });
        if (response.ok) return await response.json();
        const retryable = response.status === 429 || response.status >= 500;
        const error = new FplUpstreamError(
          `FPL upstream returned ${response.status} for ${path}`,
          response.status,
          retryable
        );
        if (!retryable) throw error;
        lastError = error;
      } catch (error) {
        const timeoutError = error instanceof Error && error.name === "AbortError";
        const normalized = error instanceof FplUpstreamError ? error : new FplUpstreamError(
          timeoutError ? `FPL upstream timeout for ${path}` : `FPL upstream fetch failed for ${path}: ${error instanceof Error ? error.message : String(error)}`,
          null,
          true,
          { cause: error }
        );
        if (!normalized.retryable) throw normalized;
        lastError = normalized;
      } finally {
        clearTimeout(timeout);
      }
      if (attempt < this.maxAttempts) {
        const delayMs = 250 * 2 ** (attempt - 1) + Math.floor(Math.random() * 100);
        this.logger.warn(`FPL fetch attempt ${attempt}/${this.maxAttempts} failed for ${path}`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    const failure = lastError instanceof Error ? lastError : new Error(`Unknown FPL upstream failure for ${path}`);
    this.logger.error(failure.message);
    throw failure;
  }
};

// src/FplCache.ts
var FplCache = class {
  constructor(kv) {
    this.kv = kv;
  }
  kv;
  static {
    __name(this, "FplCache");
  }
  memory = /* @__PURE__ */ new Map();
  async get(key) {
    const memoryRecord = this.memory.get(key);
    if (memoryRecord) return memoryRecord;
    if (this.kv) {
      const serialized = await this.kv.get(`fpl:${key}`);
      if (serialized) {
        const record = JSON.parse(serialized);
        this.memory.set(key, record);
        return record;
      }
    }
    const cloudflareCache = this.getCloudflareCache();
    if (cloudflareCache) {
      const response = await cloudflareCache.match(this.cacheRequest(key));
      if (response) {
        const record = await response.json();
        this.memory.set(key, record);
        return record;
      }
    }
    return null;
  }
  async put(key, value, hash, ttlSeconds) {
    const now = Date.now();
    const record = {
      value,
      hash,
      updatedAt: new Date(now).toISOString(),
      expiresAt: now + ttlSeconds * 1e3
    };
    this.memory.set(key, record);
    const serialized = JSON.stringify(record);
    if (this.kv) {
      await this.kv.put(`fpl:${key}`, serialized, {
        expirationTtl: Math.max(ttlSeconds * 12, 86400)
      });
    }
    const cloudflareCache = this.getCloudflareCache();
    if (cloudflareCache) {
      await cloudflareCache.put(
        this.cacheRequest(key),
        new Response(serialized, {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${Math.max(ttlSeconds * 12, 86400)}`
          }
        })
      );
    }
    return record;
  }
  async getOrFetch(key, ttlSeconds, hashValue, fetcher, force = false) {
    const previous = await this.get(key);
    if (!force && previous && previous.expiresAt > Date.now()) {
      return { record: previous, stale: false };
    }
    try {
      const value = await fetcher();
      const record = await this.put(key, value, hashValue(value), ttlSeconds);
      return { record, stale: false };
    } catch (error) {
      if (previous) {
        return {
          record: previous,
          stale: true,
          error: error instanceof Error ? error.message : String(error)
        };
      }
      throw error;
    }
  }
  cacheRequest(key) {
    return new Request(`https://dc5-fpl-cache.internal/${encodeURIComponent(key)}`);
  }
  getCloudflareCache() {
    const cacheStorage = globalThis.caches;
    return cacheStorage?.default ?? null;
  }
};

// src/FplLivePointsCalculator.ts
var FplLivePointsCalculator = class {
  static {
    __name(this, "FplLivePointsCalculator");
  }
  calculate(picks, livePlayers, options) {
    const liveByPlayer = new Map(livePlayers.map((player) => [player.playerId, player]));
    const multipliers = new Map(picks.picks.map((pick) => [pick.playerId, pick.multiplier]));
    const isBenchBoost = picks.activeChip === "bboost";
    if (isBenchBoost) {
      for (const pick of picks.picks.filter((candidate) => candidate.position > 11)) {
        multipliers.set(pick.playerId, Math.max(1, multipliers.get(pick.playerId) ?? 0));
      }
    }
    for (const substitution of [...picks.automaticSubstitutions].sort(
      (a, b) => a.order - b.order
    )) {
      multipliers.set(substitution.playerOut, 0);
      multipliers.set(substitution.playerIn, 1);
    }
    this.applyViceCaptainFallback(picks.picks, multipliers, options.availability);
    const playerScores = picks.picks.map((pick) => {
      const live = liveByPlayer.get(pick.playerId);
      const points = live?.totalPoints ?? 0;
      const multiplier = multipliers.get(pick.playerId) ?? 0;
      return {
        playerId: pick.playerId,
        points,
        multiplier,
        effectivePoints: points * multiplier,
        position: pick.position,
        isCaptain: pick.isCaptain,
        isViceCaptain: pick.isViceCaptain,
        isBench: pick.position > 11
      };
    });
    const grossPoints = playerScores.reduce((total, player) => total + player.effectivePoints, 0);
    const benchPoints = playerScores.filter((player) => player.isBench).reduce((total, player) => total + player.points, 0);
    const captainPoints = playerScores.filter((player) => player.isCaptain || player.isViceCaptain).reduce((total, player) => total + Math.max(0, player.multiplier - 1) * player.points, 0);
    return {
      entryId: picks.entryId,
      gameweek: picks.gameweek,
      grossPoints,
      transferHit: picks.transferCost,
      livePoints: grossPoints - picks.transferCost,
      benchPoints,
      captainPoints,
      provisional: options.provisional,
      activeChip: picks.activeChip,
      players: playerScores
    };
  }
  buildOwnershipIndex(entries) {
    const ownership = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      for (const pick of entry.picks) {
        const owners = ownership.get(pick.playerId) ?? /* @__PURE__ */ new Set();
        owners.add(entry.entryId);
        ownership.set(pick.playerId, owners);
      }
    }
    return ownership;
  }
  applyViceCaptainFallback(picks, multipliers, availability) {
    if (!availability) return;
    const captain = picks.find((pick) => pick.isCaptain);
    const viceCaptain = picks.find((pick) => pick.isViceCaptain);
    if (!captain || !viceCaptain) return;
    const captainAvailability = availability.get(captain.playerId);
    const viceAvailability = availability.get(viceCaptain.playerId);
    if (captainAvailability?.fixtureFinal && !captainAvailability.appeared && viceAvailability?.appeared) {
      const captainMultiplier = Math.max(2, multipliers.get(captain.playerId) ?? 2);
      multipliers.set(captain.playerId, 0);
      multipliers.set(viceCaptain.playerId, captainMultiplier);
    }
  }
};

// src/FplGameweekResolver.ts
var FplGameweekResolver = class {
  static {
    __name(this, "FplGameweekResolver");
  }
  resolve(gameweeks, fixtures, now = /* @__PURE__ */ new Date(), targetGameweek) {
    if (gameweeks.length === 0) {
      return { gameweek: null, phase: "PRESEASON", pollIntervalSeconds: 300 };
    }
    const explicitlySelected = gameweeks.find((gameweek2) => gameweek2.id === targetGameweek);
    const explicitlyCurrent = gameweeks.find((gameweek2) => gameweek2.isCurrent);
    const firstUnfinished = gameweeks.find((gameweek2) => !gameweek2.finished);
    const gameweek = explicitlySelected ?? explicitlyCurrent ?? firstUnfinished ?? gameweeks[gameweeks.length - 1];
    const selectedFixtures = fixtures.filter((fixture) => fixture.gameweek === gameweek.id);
    const live = selectedFixtures.some((fixture) => fixture.started && !fixture.finished);
    const allFinished = selectedFixtures.length > 0 && selectedFixtures.every((fixture) => fixture.finished);
    const beforeDeadline = gameweek.deadlineTime !== null && now.getTime() < new Date(gameweek.deadlineTime).getTime();
    if (live) return { gameweek, phase: "LIVE", pollIntervalSeconds: 20 };
    if (gameweek.finished && gameweek.dataChecked) {
      return { gameweek, phase: "FINAL", pollIntervalSeconds: 900 };
    }
    if (allFinished || selectedFixtures.some((fixture) => fixture.finishedProvisional)) {
      return { gameweek, phase: "PROVISIONAL", pollIntervalSeconds: 60 };
    }
    if (beforeDeadline) {
      const hasPrevious = gameweeks.some((candidate) => candidate.finished);
      return {
        gameweek,
        phase: hasPrevious ? "PRE_DEADLINE" : "PRESEASON",
        pollIntervalSeconds: 300
      };
    }
    return { gameweek, phase: "LOCKED", pollIntervalSeconds: 60 };
  }
};

// src/utils.ts
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
__name(isRecord, "isRecord");
function asArray(value) {
  return Array.isArray(value) ? value : [];
}
__name(asArray, "asArray");
function asString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}
__name(asString, "asString");
function asNullableString(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}
__name(asNullableString, "asNullableString");
function asNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
__name(asNumber, "asNumber");
function asNullableNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
__name(asNullableNumber, "asNullableNumber");
function asBoolean(value) {
  return value === true;
}
__name(asBoolean, "asBoolean");
function stableHash(value) {
  const text = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
__name(stableHash, "stableHash");

// src/FplNormalizer.ts
var FplNormalizer = class {
  static {
    __name(this, "FplNormalizer");
  }
  normalizeBootstrap(raw) {
    const record = isRecord(raw) ? raw : {};
    return {
      gameweeks: asArray(record.events).map((value) => {
        const event = isRecord(value) ? value : {};
        return {
          id: asNumber(event.id),
          name: asString(event.name, `Gameweek ${asNumber(event.id)}`),
          deadlineTime: asNullableString(event.deadline_time),
          averageEntryScore: asNullableNumber(event.average_entry_score),
          highestScore: asNullableNumber(event.highest_score),
          finished: asBoolean(event.finished),
          dataChecked: asBoolean(event.data_checked),
          isCurrent: asBoolean(event.is_current),
          isNext: asBoolean(event.is_next),
          isPrevious: asBoolean(event.is_previous)
        };
      }),
      players: asArray(record.elements).map((value) => {
        const player = isRecord(value) ? value : {};
        return {
          id: asNumber(player.id),
          firstName: asString(player.first_name),
          secondName: asString(player.second_name),
          webName: asString(player.web_name),
          teamId: asNullableNumber(player.team),
          positionId: asNullableNumber(player.element_type),
          totalPoints: asNumber(player.total_points),
          price: asNumber(player.now_cost),
          status: asNullableString(player.status),
          code: asNumber(player.code),
          teamCode: asNullableNumber(player.team_code),
          squadNumber: asNullableNumber(player.squad_number),
          photo: asNullableString(player.photo),
          selectedByPercent: asString(player.selected_by_percent, "0"),
          form: asString(player.form, "0"),
          pointsPerGame: asString(player.points_per_game, "0"),
          minutes: asNumber(player.minutes),
          goalsScored: asNumber(player.goals_scored),
          assists: asNumber(player.assists),
          cleanSheets: asNumber(player.clean_sheets),
          goalsConceded: asNumber(player.goals_conceded),
          ownGoals: asNumber(player.own_goals),
          penaltiesSaved: asNumber(player.penalties_saved),
          penaltiesMissed: asNumber(player.penalties_missed),
          yellowCards: asNumber(player.yellow_cards),
          redCards: asNumber(player.red_cards)
        };
      }),
      teams: asArray(record.teams).map((value) => {
        const team = isRecord(value) ? value : {};
        return {
          id: asNumber(team.id),
          name: asString(team.name),
          shortName: asString(team.short_name),
          code: asNumber(team.code),
          strength: asNumber(team.strength),
          strengthOverallHome: asNumber(team.strength_overall_home),
          strengthOverallAway: asNumber(team.strength_overall_away),
          strengthAttackHome: asNumber(team.strength_attack_home),
          strengthAttackAway: asNumber(team.strength_attack_away),
          strengthDefenceHome: asNumber(team.strength_defence_home),
          strengthDefenceAway: asNumber(team.strength_defence_away)
        };
      }),
      elementTypes: asArray(record.element_types).map((value) => {
        const type = isRecord(value) ? value : {};
        return {
          id: asNumber(type.id),
          singularName: asString(type.singular_name),
          pluralName: asString(type.plural_name)
        };
      }),
      totalPlayers: asNumber(record.total_players)
    };
  }
  normalizeFixtures(raw) {
    return asArray(raw).map((value) => {
      const fixture = isRecord(value) ? value : {};
      return {
        id: asNumber(fixture.id),
        gameweek: asNullableNumber(fixture.event),
        homeTeamId: asNullableNumber(fixture.team_h),
        awayTeamId: asNullableNumber(fixture.team_a),
        homeScore: asNullableNumber(fixture.team_h_score),
        awayScore: asNullableNumber(fixture.team_a_score),
        kickoffTime: asNullableString(fixture.kickoff_time),
        started: asBoolean(fixture.started),
        finished: asBoolean(fixture.finished),
        finishedProvisional: asBoolean(fixture.finished_provisional),
        minutes: asNullableNumber(fixture.minutes)
      };
    });
  }
  normalizeLivePlayers(raw) {
    const root = isRecord(raw) ? raw : {};
    return asArray(root.elements).map((value) => {
      const element = isRecord(value) ? value : {};
      const stats = isRecord(element.stats) ? element.stats : {};
      return {
        playerId: asNumber(element.id),
        minutes: asNumber(stats.minutes),
        totalPoints: asNumber(stats.total_points),
        bonus: asNumber(stats.bonus),
        bps: asNumber(stats.bps),
        goalsScored: asNumber(stats.goals_scored),
        assists: asNumber(stats.assists),
        cleanSheets: asNumber(stats.clean_sheets),
        goalsConceded: asNumber(stats.goals_conceded),
        ownGoals: asNumber(stats.own_goals),
        penaltiesSaved: asNumber(stats.penalties_saved),
        penaltiesMissed: asNumber(stats.penalties_missed),
        yellowCards: asNumber(stats.yellow_cards),
        redCards: asNumber(stats.red_cards),
        saves: asNumber(stats.saves)
      };
    });
  }
  normalizeEntry(raw) {
    const entry = isRecord(raw) ? raw : {};
    const leagues = isRecord(entry.leagues) ? entry.leagues : {};
    const managerName = [asString(entry.player_first_name), asString(entry.player_last_name)].filter(Boolean).join(" ");
    return {
      id: asNumber(entry.id),
      teamName: asString(entry.name, "Team"),
      managerName: managerName || "Manager",
      overallPoints: asNumber(entry.summary_overall_points),
      overallRank: asNullableNumber(entry.summary_overall_rank),
      currentGameweek: asNullableNumber(entry.current_event),
      classicLeagueIds: asArray(leagues.classic).map((value) => isRecord(value) ? asNumber(value.id) : 0).filter((id) => id > 0)
    };
  }
  normalizeEntryHistory(raw) {
    const history = isRecord(raw) ? raw : {};
    return {
      current: asArray(history.current).map((value) => {
        const item = isRecord(value) ? value : {};
        return {
          gameweek: asNumber(item.event),
          points: asNumber(item.points),
          totalPoints: asNumber(item.total_points),
          overallRank: asNullableNumber(item.overall_rank),
          transferCost: asNumber(item.event_transfers_cost),
          bank: asNumber(item.bank),
          teamValue: asNumber(item.value)
        };
      }),
      past: asArray(history.past).map((value) => {
        const item = isRecord(value) ? value : {};
        return {
          season: asString(item.season_name),
          points: asNumber(item.total_points),
          rank: asNullableNumber(item.rank)
        };
      })
    };
  }
  normalizeEntryPicks(raw, entryId, gameweek) {
    const root = isRecord(raw) ? raw : {};
    const history = isRecord(root.entry_history) ? root.entry_history : {};
    const automaticSubstitutions = asArray(root.automatic_subs).map(
      (value) => {
        const sub = isRecord(value) ? value : {};
        return {
          playerIn: asNumber(sub.element_in),
          playerOut: asNumber(sub.element_out),
          order: asNumber(sub.sub_order)
        };
      }
    );
    return {
      entryId,
      gameweek,
      activeChip: asNullableString(root.active_chip),
      transferCost: asNumber(history.event_transfers_cost),
      bank: asNullableNumber(history.bank),
      teamValue: asNullableNumber(history.value),
      picks: asArray(root.picks).map((value) => {
        const pick = isRecord(value) ? value : {};
        return {
          playerId: asNumber(pick.element),
          position: asNumber(pick.position),
          multiplier: asNumber(pick.multiplier),
          isCaptain: asBoolean(pick.is_captain),
          isViceCaptain: asBoolean(pick.is_vice_captain)
        };
      }),
      automaticSubstitutions
    };
  }
  normalizeLeaguePage(raw, leagueId) {
    const root = isRecord(raw) ? raw : {};
    const league = isRecord(root.league) ? root.league : {};
    const standings = isRecord(root.standings) ? root.standings : {};
    const ranked = asArray(standings.results);
    const newEntries = isRecord(root.new_entries) ? root.new_entries : {};
    const source = ranked.length > 0 ? ranked : asArray(newEntries.results);
    return {
      leagueId,
      leagueName: asString(league.name, `League ${leagueId}`),
      page: asNumber(ranked.length > 0 ? standings.page : newEntries.page, 1),
      hasNext: asBoolean(ranked.length > 0 ? standings.has_next : newEntries.has_next),
      members: source.map((value, index) => {
        const member = isRecord(value) ? value : {};
        return {
          entryId: asNumber(member.entry),
          managerName: asString(member.player_name) || [asString(member.player_first_name), asString(member.player_last_name)].filter(Boolean).join(" ") || "Manager",
          teamName: asString(member.entry_name, "Team"),
          rank: asNullableNumber(member.rank) ?? index + 1,
          previousRank: asNullableNumber(member.last_rank ?? member.previous_rank),
          gameweekPoints: asNumber(member.event_total),
          totalPoints: asNumber(member.total)
        };
      })
    };
  }
};

// src/FplLiveService.ts
var FplLiveService = class {
  constructor(client, cache, normalizer = new FplNormalizer(), resolver = new FplGameweekResolver(), calculator = new FplLivePointsCalculator()) {
    this.client = client;
    this.cache = cache;
    this.normalizer = normalizer;
    this.resolver = resolver;
    this.calculator = calculator;
  }
  client;
  cache;
  normalizer;
  resolver;
  calculator;
  static {
    __name(this, "FplLiveService");
  }
  async getStatus() {
    try {
      const current = await this.getCurrentGameweek();
      return current;
    } catch (error) {
      return this.errorResponse(error);
    }
  }
  async getBootstrap() {
    try {
      return this.resourceResponse(
        await this.cache.getOrFetch(
          "bootstrap",
          300,
          stableHash,
          async () => this.normalizer.normalizeBootstrap(await this.client.getBootstrap())
        )
      );
    } catch (error) {
      return this.errorResponse(error);
    }
  }
  async getFixtures(gameweek, ttlSeconds = 180, force = false) {
    try {
      return this.resourceResponse(
        await this.cache.getOrFetch(
          `fixtures:${gameweek}`,
          ttlSeconds,
          stableHash,
          async () => this.normalizer.normalizeFixtures(await this.client.getFixtures(gameweek)),
          force
        )
      );
    } catch (error) {
      return this.errorResponse(error);
    }
  }
  async getCurrentGameweek() {
    try {
      const bootstrap = await this.getBootstrap();
      if (!bootstrap.data) return this.errorResponse(bootstrap.error ?? "Bootstrap unavailable");
      const candidate = bootstrap.data.gameweeks.find((gameweek) => gameweek.isCurrent) ?? bootstrap.data.gameweeks.find((gameweek) => !gameweek.finished) ?? bootstrap.data.gameweeks.at(-1) ?? null;
      const fixtures = candidate ? await this.getFixtures(candidate.id) : null;
      const resolved = this.resolver.resolve(bootstrap.data.gameweeks, fixtures?.data ?? []);
      return {
        data: resolved,
        dataStatus: this.combineStatus(bootstrap.dataStatus, fixtures?.dataStatus),
        lastUpdated: fixtures?.lastUpdated ?? bootstrap.lastUpdated,
        ...bootstrap.error || fixtures?.error ? { error: bootstrap.error ?? fixtures?.error } : {}
      };
    } catch (error) {
      return this.errorResponse(error);
    }
  }
  async getGameweekLive(gameweek) {
    try {
      const [bootstrap, initialFixtures] = await Promise.all([
        this.getBootstrap(),
        this.getFixtures(gameweek)
      ]);
      if (!bootstrap.data || !initialFixtures.data) {
        return this.errorResponse(
          bootstrap.error ?? initialFixtures.error ?? "Gameweek data unavailable"
        );
      }
      let fixtures = initialFixtures;
      let fixtureData = initialFixtures.data;
      let resolved = this.resolver.resolve(
        bootstrap.data.gameweeks,
        fixtureData,
        /* @__PURE__ */ new Date(),
        gameweek
      );
      const fixtureAgeMs = Date.now() - new Date(fixtures.lastUpdated).getTime();
      if (resolved.phase === "LIVE" && fixtureAgeMs > 2e4) {
        fixtures = await this.getFixtures(gameweek, 20, true);
        if (!fixtures.data) return this.errorResponse(fixtures.error ?? "Fixtures unavailable");
        fixtureData = fixtures.data;
        resolved = this.resolver.resolve(
          bootstrap.data.gameweeks,
          fixtureData,
          /* @__PURE__ */ new Date(),
          gameweek
        );
      }
      const ttlSeconds = resolved.gameweek?.id === gameweek ? resolved.pollIntervalSeconds : 900;
      const previous = await this.cache.get(`event-live:${gameweek}`);
      const live = await this.cache.getOrFetch(
        `event-live:${gameweek}`,
        ttlSeconds,
        stableHash,
        async () => this.normalizer.normalizeLivePlayers(await this.client.getEventLive(gameweek))
      );
      const changedPlayerIds = this.changedPlayerIds(previous?.value ?? [], live.record.value);
      const snapshot = {
        gameweek,
        phase: resolved.phase,
        provisional: resolved.phase !== "FINAL",
        players: live.record.value,
        changedPlayerIds,
        fixtures: fixtureData,
        availability: this.buildAvailability(bootstrap.data, fixtureData, live.record.value),
        hash: live.record.hash
      };
      return {
        data: snapshot,
        dataStatus: this.combineStatus(live.stale ? "STALE" : "LIVE", fixtures.dataStatus),
        lastUpdated: live.record.updatedAt,
        ...live.error ? { error: live.error } : {}
      };
    } catch (error) {
      return this.errorResponse(error);
    }
  }
  async getEntry(entryId) {
    return this.fetchNormalized(
      `entry:${entryId}`,
      300,
      async () => this.normalizer.normalizeEntry(await this.client.getEntry(entryId))
    );
  }
  async getEntryHistory(entryId) {
    return this.fetchNormalized(
      `entry-history:${entryId}`,
      300,
      async () => this.normalizer.normalizeEntryHistory(await this.client.getEntryHistory(entryId))
    );
  }
  async getEntryPicks(entryId, gameweek) {
    return this.fetchNormalized(
      `entry-picks:${entryId}:${gameweek}`,
      900,
      async () => this.normalizer.normalizeEntryPicks(
        await this.client.getEntryPicks(entryId, gameweek),
        entryId,
        gameweek
      )
    );
  }
  async getEntryLive(entryId, gameweek) {
    try {
      const [picks, live] = await Promise.all([
        this.getEntryPicks(entryId, gameweek),
        this.getGameweekLive(gameweek)
      ]);
      if (!picks.data || !live.data) {
        return this.errorResponse(picks.error ?? live.error ?? "Entry live data unavailable");
      }
      const score = this.calculator.calculate(picks.data, live.data.players, {
        provisional: live.data.provisional,
        availability: new Map(
          Object.entries(live.data.availability).map(([playerId, availability]) => [
            Number(playerId),
            availability
          ])
        )
      });
      return {
        data: score,
        dataStatus: this.combineStatus(picks.dataStatus, live.dataStatus),
        lastUpdated: live.lastUpdated,
        ...picks.error || live.error ? { error: picks.error ?? live.error } : {}
      };
    } catch (error) {
      return this.errorResponse(error);
    }
  }
  async fetchNormalized(key, ttlSeconds, fetcher) {
    try {
      return this.resourceResponse(
        await this.cache.getOrFetch(key, ttlSeconds, stableHash, fetcher)
      );
    } catch (error) {
      return this.errorResponse(error);
    }
  }
  resourceResponse(result) {
    return {
      data: result.record.value,
      dataStatus: result.stale ? "STALE" : "LIVE",
      lastUpdated: result.record.updatedAt,
      ...result.error ? { error: result.error } : {}
    };
  }
  errorResponse(error) {
    return {
      data: null,
      dataStatus: "ERROR",
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
  }
  combineStatus(...statuses) {
    if (statuses.some((status) => status === "ERROR")) return "ERROR";
    if (statuses.some((status) => status === "STALE")) return "STALE";
    return "LIVE";
  }
  changedPlayerIds(previous, current) {
    const previousHash = new Map(
      previous.map((player) => [
        player.playerId,
        stableHash([player.totalPoints, player.minutes, player.bonus, player.bps])
      ])
    );
    return current.filter(
      (player) => previousHash.get(player.playerId) !== stableHash([player.totalPoints, player.minutes, player.bonus, player.bps])
    ).map((player) => player.playerId);
  }
  buildAvailability(bootstrap, fixtures, livePlayers) {
    const liveByPlayer = new Map(livePlayers.map((player) => [player.playerId, player]));
    return Object.fromEntries(
      bootstrap.players.map((player) => {
        const playerFixtures = fixtures.filter(
          (fixture) => fixture.homeTeamId === player.teamId || fixture.awayTeamId === player.teamId
        );
        return [
          String(player.id),
          {
            appeared: (liveByPlayer.get(player.id)?.minutes ?? 0) > 0,
            fixtureFinal: playerFixtures.length > 0 && playerFixtures.every((fixture) => fixture.finished)
          }
        ];
      })
    );
  }
};

// src/FplLeagueService.ts
async function mapWithConcurrency(values, concurrency, worker) {
  const results = new Array(values.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(values[index]);
    }
  });
  await Promise.all(runners);
  return results;
}
__name(mapWithConcurrency, "mapWithConcurrency");
var FplLeagueService = class {
  constructor(client, cache, liveService, normalizer = new FplNormalizer(), calculator = new FplLivePointsCalculator()) {
    this.client = client;
    this.cache = cache;
    this.liveService = liveService;
    this.normalizer = normalizer;
    this.calculator = calculator;
  }
  client;
  cache;
  liveService;
  normalizer;
  calculator;
  static {
    __name(this, "FplLeagueService");
  }
  async getLeaguePage(leagueId, page = 1) {
    try {
      const cached = await this.cache.getOrFetch(
        `league:${leagueId}:page:${page}`,
        120,
        stableHash,
        async () => this.normalizer.normalizeLeaguePage(
          await this.client.getLeagueStandings(leagueId, page),
          leagueId
        )
      );
      return {
        data: cached.record.value,
        dataStatus: cached.stale ? "STALE" : "LIVE",
        lastUpdated: cached.record.updatedAt,
        ...cached.error ? { error: cached.error } : {}
      };
    } catch (error) {
      return this.errorResponse(error);
    }
  }
  async getLiveLeague(leagueId, gameweek) {
    try {
      const pages = await this.getAllLeaguePages(leagueId);
      if (pages.length === 0) return this.errorResponse("League standings unavailable");
      const members = this.uniqueMembers(pages.flatMap((page) => page.members));
      const entryIds = members.map((member) => member.entryId);
      const picksResponses = await mapWithConcurrency(
        entryIds,
        8,
        (entryId) => this.liveService.getEntryPicks(entryId, gameweek)
      );
      const picks = picksResponses.map((response) => response.data).filter((value) => value !== null);
      const ownership = this.calculator.buildOwnershipIndex(picks);
      const live = await this.liveService.getGameweekLive(gameweek);
      if (!live.data) return this.errorResponse(live.error ?? "Live gameweek unavailable");
      const previousScores = (await this.cache.get(
        `league:${leagueId}:scores:${gameweek}`
      ))?.value ?? {};
      const previousPickHashes = (await this.cache.get(`league:${leagueId}:pick-hashes:${gameweek}`))?.value ?? {};
      const currentPickHashes = Object.fromEntries(
        picks.map((entryPicks) => [String(entryPicks.entryId), stableHash(entryPicks)])
      );
      const affectedEntries = this.affectedEntries(live.data.changedPlayerIds, ownership);
      const scores = { ...previousScores };
      const availability = new Map(
        Object.entries(live.data.availability).map(([playerId, state]) => [Number(playerId), state])
      );
      for (const entryPicks of picks) {
        if (!scores[entryPicks.entryId] || affectedEntries.has(entryPicks.entryId) || previousPickHashes[entryPicks.entryId] !== currentPickHashes[entryPicks.entryId]) {
          scores[entryPicks.entryId] = this.calculator.calculate(entryPicks, live.data.players, {
            provisional: live.data.provisional,
            availability
          });
        }
      }
      await this.cache.put(
        `league:${leagueId}:scores:${gameweek}`,
        scores,
        stableHash(scores),
        live.data.provisional ? 86400 : 604800
      );
      await this.cache.put(
        `league:${leagueId}:pick-hashes:${gameweek}`,
        currentPickHashes,
        stableHash(currentPickHashes),
        604800
      );
      const calculated = members.map((member) => {
        const score = scores[member.entryId];
        return {
          ...member,
          liveGameweekPoints: score?.livePoints ?? member.gameweekPoints,
          liveTotalPoints: member.totalPoints - member.gameweekPoints + (score?.livePoints ?? member.gameweekPoints),
          liveRank: 0,
          rankMovement: null,
          provisional: live.data.provisional
        };
      });
      calculated.sort(
        (a, b) => b.liveTotalPoints - a.liveTotalPoints || (a.rank ?? 9999) - (b.rank ?? 9999)
      );
      calculated.forEach((member, index) => {
        member.liveRank = index + 1;
        member.rankMovement = member.rank === null ? null : member.rank - member.liveRank;
      });
      const data = {
        leagueId,
        leagueName: pages[0].leagueName,
        gameweek,
        entryIds,
        ownershipIndex: Object.fromEntries(
          [...ownership].map(([playerId, owners]) => [String(playerId), [...owners]])
        ),
        changedPlayerIds: live.data.changedPlayerIds,
        members: calculated,
        provisional: live.data.provisional
      };
      const status = this.combineStatus([
        live.dataStatus,
        ...picksResponses.map((response) => response.dataStatus)
      ]);
      return {
        data,
        dataStatus: status,
        lastUpdated: live.lastUpdated,
        ...picksResponses.some((response) => response.error) ? {
          error: "One or more manager picks were unavailable; previous valid scores were preserved."
        } : {}
      };
    } catch (error) {
      return this.errorResponse(error);
    }
  }
  async getAllLeaguePages(leagueId) {
    const pages = [];
    for (let pageNumber = 1; pageNumber <= 100; pageNumber += 1) {
      const response = await this.getLeaguePage(leagueId, pageNumber);
      if (!response.data) break;
      pages.push(response.data);
      if (!response.data.hasNext) break;
    }
    return pages;
  }
  uniqueMembers(members) {
    return [...new Map(members.map((member) => [member.entryId, member])).values()];
  }
  affectedEntries(changedPlayerIds, ownership) {
    const affected = /* @__PURE__ */ new Set();
    for (const playerId of changedPlayerIds) {
      for (const entryId of ownership.get(playerId) ?? []) affected.add(entryId);
    }
    return affected;
  }
  combineStatus(statuses) {
    if (statuses.some((status) => status === "ERROR")) return "ERROR";
    if (statuses.some((status) => status === "STALE")) return "STALE";
    return "LIVE";
  }
  errorResponse(error) {
    return {
      data: null,
      dataStatus: "ERROR",
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// src/index.ts
function createServices(env) {
  const client = new FplApiClient();
  const cache = new FplCache(env.FPL_CACHE);
  const live = new FplLiveService(client, cache);
  return { live, league: new FplLeagueService(client, cache, live) };
}
__name(createServices, "createServices");
function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
      Vary: "Origin"
    }
  });
}
__name(jsonResponse, "jsonResponse");
function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
__name(positiveInteger, "positiveInteger");
async function route(request, env) {
  const origin = env.ALLOWED_ORIGIN ?? "*";
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  if (request.method !== "GET") return jsonResponse({ error: "Method not allowed" }, 405, origin);
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  const { live, league } = createServices(env);
  let result;
  if (path === "/api/fpl/status") result = await live.getStatus();
  else if (path === "/api/fpl/bootstrap") result = await live.getBootstrap();
  else if (path === "/api/fpl/gameweek/current") result = await live.getCurrentGameweek();
  else {
    let match = path.match(/^\/api\/fpl\/fixtures\/(\d+)$/);
    if (match) result = await live.getFixtures(Number(match[1]));
    else if (match = path.match(/^\/api\/fpl\/gameweek\/(\d+)\/live$/)) {
      result = await live.getGameweekLive(Number(match[1]));
    } else if (match = path.match(/^\/api\/fpl\/entry\/(\d+)$/)) {
      result = await live.getEntry(Number(match[1]));
    } else if (match = path.match(/^\/api\/fpl\/entry\/(\d+)\/history$/)) {
      result = await live.getEntryHistory(Number(match[1]));
    } else if (match = path.match(/^\/api\/fpl\/entry\/(\d+)\/gameweek\/(\d+)\/picks$/)) {
      result = await live.getEntryPicks(Number(match[1]), Number(match[2]));
    } else if (match = path.match(/^\/api\/fpl\/entry\/(\d+)\/live$/)) {
      const gameweek = positiveInteger(url.searchParams.get("gw") ?? void 0);
      if (!gameweek)
        return jsonResponse({ error: "A positive gw query parameter is required." }, 400, origin);
      result = await live.getEntryLive(Number(match[1]), gameweek);
    } else if (match = path.match(/^\/api\/fpl\/league\/(\d+)\/standings$/)) {
      const page = positiveInteger(url.searchParams.get("page") ?? void 0) ?? 1;
      result = await league.getLeaguePage(Number(match[1]), page);
    } else if (match = path.match(/^\/api\/fpl\/league\/(\d+)\/live$/)) {
      const gameweek = positiveInteger(url.searchParams.get("gw") ?? void 0);
      if (!gameweek)
        return jsonResponse({ error: "A positive gw query parameter is required." }, 400, origin);
      result = await league.getLiveLeague(Number(match[1]), gameweek);
    } else {
      return jsonResponse({ error: "Not found" }, 404, origin);
    }
  }
  const responseStatus = typeof result === "object" && result !== null && "dataStatus" in result && result.dataStatus === "ERROR" ? 503 : 200;
  return jsonResponse(result, responseStatus, origin);
}
__name(route, "route");
async function warmConfiguredResources(env) {
  const { live, league } = createServices(env);
  const current = await live.getCurrentGameweek();
  const gameweek = current.data?.gameweek?.id;
  if (!gameweek) return;
  await live.getGameweekLive(gameweek);
  const entryId = positiveInteger(env.DEV_FPL_ENTRY_ID);
  const leagueId = positiveInteger(env.DEV_FPL_LEAGUE_ID);
  if (entryId) await live.getEntryLive(entryId, gameweek);
  if (leagueId) await league.getLiveLeague(leagueId, gameweek);
}
__name(warmConfiguredResources, "warmConfiguredResources");
var src_default = {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      console.error("Unhandled FPL internal API error", error);
      return jsonResponse(
        {
          data: null,
          dataStatus: "ERROR",
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
          error: "FPL live service is temporarily unavailable."
        },
        503,
        env.ALLOWED_ORIGIN ?? "*"
      );
    }
  },
  scheduled(_controller, env, context) {
    context.waitUntil(
      warmConfiguredResources(env).catch((error) => {
        console.error("Scheduled FPL warm-up failed", error);
      })
    );
  }
};

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-gxP1pH/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-gxP1pH/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
