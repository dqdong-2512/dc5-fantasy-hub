/**
 * Transfer Planner Page
 * Main orchestration for transfer planning and squad optimization
 * Implements the complete workflow: select player -> find replacements -> compare -> build plan -> validate -> preview
 */

import React, { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { ThemeTokens } from '@shared/theme/tokens';
import { PlayerRepository } from '@repositories/players';
import { TeamRepository } from '@repositories/teams';
import { getBootstrapRepository } from '@repositories/index';
import { useGameweekHubState } from '../context';
import { useEnrichedManagerPicks } from '../hooks';
import type { SquadPlayer, TransferPlan, TransferMove } from '../domain/TransferPlan';
import { TransferBudgetService, TransferPlanService, TransferPlanRepository } from '../services';
import {
  PlayerOutSelector,
  ReplacementCandidates,
  TransferComparison,
  TransferPlanSummary,
  PlannedSquadPreview,
  SquadBeforeAfter,
  SavedPlansPanel,
} from '../components/transfer-planner';

type ViewType = 'planner' | 'preview' | 'saved';

export const TransferPlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gameState = useGameweekHubState();

  // Services
  const playerRepo = useMemo(() => new PlayerRepository(), []);
  const teamRepo = useMemo(() => new TeamRepository(), []);
  const budgetService = useMemo(() => new TransferBudgetService(), []);
  const planService = useMemo(() => new TransferPlanService(), []);
  const planRepository = useMemo(() => new TransferPlanRepository(), []);
  const currentGameweekId = useMemo(
    () => getBootstrapRepository().getCurrentGameweek()?.id ?? 1,
    []
  );
  const runtimePicks = useEnrichedManagerPicks(
    gameState.connectedEntryId,
    gameState.displayGameweek ?? currentGameweekId
  );

  // Current squad from the connected FPL entry.
  const currentSquadData = useMemo((): SquadPlayer[] => {
    const squad = runtimePicks.enrichedPicks?.picks ?? [];
    return squad.map((pick: any) => {
      const player = playerRepo.getById(pick.element);
      if (!player) {
        return {
          playerId: pick.element,
          position: pick.position,
          isStarter: pick.position <= 11,
          benchOrder: pick.position > 11 ? pick.position - 12 : undefined,
          isCaptain: pick.isCaptain,
          isViceCaptain: pick.isViceCaptain,
          price: 0,
          teamId: 0,
          totalPoints: 0,
          form: 0,
        };
      }

      const team = teamRepo.getAll().find((t) => t.name === player.club);

      return {
        playerId: pick.element,
        position: pick.position,
        isStarter: pick.position <= 11,
        benchOrder: pick.position > 11 ? pick.position - 12 : undefined,
        isCaptain: pick.isCaptain,
        isViceCaptain: pick.isViceCaptain,
        price: player.price,
        teamId: team?.id ?? 0,
        totalPoints: player.totalPoints,
        form: player.form,
        valueScore: (player as any).valueScore,
        fixtureScore: (player as any).fixtureScore,
        transferTargetScore: (player as any).transferTargetScore,
      };
    });
  }, [playerRepo, teamRepo, runtimePicks.enrichedPicks]);

  // State
  const [activeView, setActiveView] = useState<ViewType>('planner');
  const [currentPlan, setCurrentPlan] = useState<TransferPlan>(() =>
    planService.buildTransferPlan(currentGameweekId, '')
  );
  const [selectedOutPlayerId, setSelectedOutPlayerId] = useState<number | null>(() => {
    const outParam = searchParams.get('out');
    return outParam ? parseInt(outParam, 10) : null;
  });
  const [selectedInPlayerId, setSelectedInPlayerId] = useState<number | null>(null);
  const currentBank = runtimePicks.bankValue / 10;
  const [planName, setPlanName] = useState('');
  const [savedPlans, setSavedPlans] = useState<TransferPlan[]>(planRepository.loadAllPlans());
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate available budget when outgoing player changes
  const availableBudget = useMemo(() => {
    if (selectedOutPlayerId) {
      return budgetService.calculateAvailableBudget(currentBank, selectedOutPlayerId);
    }
    return currentBank;
  }, [selectedOutPlayerId, currentBank, budgetService]);

  // Get planned squad IDs
  const plannedSquadIds = useMemo((): Set<number> => {
    const ids = new Set(currentSquadData.map((p) => p.playerId));

    // Remove players being transferred out
    currentPlan.transfers.forEach((t) => {
      ids.delete(t.playerOutId);
    });

    // Add players being transferred in
    currentPlan.transfers.forEach((t) => {
      ids.add(t.playerInId);
    });

    return ids;
  }, [currentSquadData, currentPlan]);

  // Handle add transfer
  const handleAddTransfer = (): void => {
    if (!selectedOutPlayerId || !selectedInPlayerId) return;

    setIsProcessing(true);
    try {
      const outPlayer = playerRepo.getById(selectedOutPlayerId);
      const inPlayer = playerRepo.getById(selectedInPlayerId);

      if (!outPlayer || !inPlayer) return;

      const sellingPrice = budgetService.estimateSellingPrice(outPlayer.price);
      const bankAfter = budgetService.calculateBankAfterTransfer(
        currentBank,
        sellingPrice,
        inPlayer.price
      );

      const transfer: TransferMove = {
        playerOutId: selectedOutPlayerId,
        playerInId: selectedInPlayerId,
        playerOutName: outPlayer.displayName,
        playerInName: inPlayer.displayName,
        sellingPriceOut: sellingPrice,
        purchasePriceIn: inPlayer.price,
        bankBefore: currentBank,
        bankAfter,
      };

      const updatedPlan = planService.addTransfer(
        currentPlan,
        transfer,
        currentSquadData,
        currentBank
      );

      setCurrentPlan(updatedPlan);
      setSelectedInPlayerId(null); // Reset selection for next transfer
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle remove transfer
  const handleRemoveTransfer = (index: number): void => {
    const updatedPlan = planService.removeTransfer(
      currentPlan,
      index,
      currentSquadData,
      currentBank
    );
    setCurrentPlan(updatedPlan);
  };

  // Handle clear plan
  const handleClearPlan = (): void => {
    setCurrentPlan(planService.clearPlan(currentPlan));
    setSelectedInPlayerId(null);
  };

  // Handle save plan
  const handleSavePlan = (): void => {
    if (!planName.trim()) {
      alert('Please enter a plan name');
      return;
    }

    const planToSave = {
      ...currentPlan,
      name: planName,
    };

    planRepository.savePlan(planToSave);
    setSavedPlans(planRepository.loadAllPlans());
    setPlanName('');
    alert('Transfer plan saved successfully');
  };

  // Handle load plan
  const handleLoadPlan = (plan: TransferPlan): void => {
    setCurrentPlan(plan);
    setSelectedInPlayerId(null);
    setActiveView('planner');
  };

  return (
    <Box sx={{ py: { xs: 2, md: 2.5 } }}>
      <Card
        data-testid="transfer-planner-hero"
        sx={{
          mb: 2.5,
          overflow: 'hidden',
          color: '#fff',
          borderRadius: ThemeTokens.borderRadius.lg,
          background: 'linear-gradient(118deg, #37003c 0%, #6d0877 50%, #0877c9 100%)',
          boxShadow: '0 18px 44px rgba(55, 0, 60, 0.2)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 230,
            height: 230,
            borderRadius: '50%',
            right: -70,
            top: -120,
            backgroundColor: 'rgba(255,255,255,0.10)',
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, position: 'relative', zIndex: 1 }}>
          <Stack spacing={2.5}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/premier-league/gameweek/my-team')}
              sx={{
                alignSelf: 'flex-start',
                color: 'rgba(255,255,255,.88)',
                textTransform: 'none',
                px: 0,
                '&:hover': { backgroundColor: 'transparent', color: '#fff' },
              }}
            >
              Back to My Team
            </Button>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: { md: 'flex-end' } }}
            >
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18, color: '#00ff87' }} />
                  <Typography
                    variant="overline"
                    sx={{ fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(255,255,255,.72)' }}
                  >
                    Squad workspace
                  </Typography>
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 850, fontSize: { xs: 32, md: 42 } }}>
                  Transfer Planner
                </Typography>
                <Typography sx={{ mt: 0.75, color: 'rgba(255,255,255,.78)' }}>
                  Explore replacements, protect your budget and preview every move before saving.
                </Typography>
              </Box>

              <Chip
                icon={<CalendarMonthIcon />}
                label={`Gameweek ${currentGameweekId}`}
                sx={{
                  alignSelf: { xs: 'flex-start', md: 'auto' },
                  height: 38,
                  px: 0.75,
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,.35)',
                  backgroundColor: 'rgba(255,255,255,.12)',
                  '& .MuiChip-icon': { color: '#00ff87' },
                }}
              />
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                gap: 1.25,
              }}
            >
              {[
                {
                  label: 'Squad loaded',
                  value: `${currentSquadData.length}/15`,
                  icon: <GroupsIcon fontSize="small" />,
                },
                {
                  label: 'In the bank',
                  value: `£${currentBank.toFixed(1)}m`,
                  icon: <AccountBalanceWalletIcon fontSize="small" />,
                },
                {
                  label: 'Planned moves',
                  value: currentPlan.transfers.length.toString(),
                  icon: <SwapHorizIcon fontSize="small" />,
                },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,.18)',
                    backgroundColor: 'rgba(255,255,255,.09)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box sx={{ color: '#00ff87', display: 'flex' }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.68)' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card
        data-testid="transfer-planner-workspace"
        variant="outlined"
        sx={{
          borderRadius: ThemeTokens.borderRadius.lg,
          overflow: 'hidden',
          borderColor: '#d9e2ef',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        }}
      >
        {/* View Tabs */}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: { xs: 1, md: 2 } }}>
          <Tabs
            value={activeView}
            onChange={(_, value) => setActiveView(value as ViewType)}
            sx={{
              '& .MuiTab-root': {
                fontSize: '0.9rem',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: { xs: 96, sm: 120 },
                minHeight: 54,
              },
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            <Tab label="Planner" value="planner" />
            <Tab label="Preview" value="preview" disabled={currentPlan.transfers.length === 0} />
            <Tab label="Saved Plans" value="saved" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Planner View */}
        {activeView === 'planner' && (
          <Stack spacing={ThemeTokens.spacing.md}>
            {currentSquadData.length === 0 && !runtimePicks.isLoading && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Your squad has not been published for this gameweek yet. The planner will populate
                automatically when the connected entry’s picks become available.
              </Alert>
            )}

            {/* Validation Alert */}
            {!currentPlan.validation.isValid && currentPlan.transfers.length > 0 && (
              <Alert severity="error">
                <Typography variant="subtitle2" sx={{ fontWeight: 600, marginBottom: 1 }}>
                  Squad Invalid
                </Typography>
                {currentPlan.validation.errors.map((err, idx) => (
                  <Typography key={idx} variant="body2">
                    - {err.message}
                  </Typography>
                ))}
              </Alert>
            )}

            {/* Two-Column Layout: Selector + Candidates */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                gap: ThemeTokens.spacing.md,
              }}
            >
              {/* Left: Player Out Selector */}
              <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: '#d9e2ef' }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <PlayerOutSelector
                  currentSquad={currentSquadData}
                  selectedPlayerId={selectedOutPlayerId}
                  onSelect={setSelectedOutPlayerId}
                />
                </CardContent>
              </Card>

              {/* Right: Replacement Candidates */}
              <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: '#d9e2ef' }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 }, minHeight: 240 }}>
                {selectedOutPlayerId ? (
                  <ReplacementCandidates
                    outgoingPlayerId={selectedOutPlayerId}
                    plannedSquadIds={plannedSquadIds}
                    availableBudget={availableBudget}
                    selectedCandidateId={selectedInPlayerId}
                    onSelectCandidate={setSelectedInPlayerId}
                    onAddTransfer={handleAddTransfer}
                    isAdding={isProcessing}
                  />
                ) : (
                  <Box
                    sx={{
                      minHeight: 190,
                      display: 'grid',
                      placeItems: 'center',
                      padding: ThemeTokens.spacing.lg,
                      background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
                      border: '1px dashed #cbd5e1',
                      borderRadius: 2,
                      textAlign: 'center',
                    }}
                  >
                    <Stack spacing={1} sx={{ alignItems: 'center', maxWidth: 320 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: '50%',
                          backgroundColor: '#e0f2fe',
                          color: '#0284c7',
                        }}
                      >
                        <SwapHorizIcon />
                      </Box>
                      <Typography sx={{ fontWeight: 750 }}>Choose an outgoing player</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Eligible replacements will be ranked here by position, budget and form.
                      </Typography>
                    </Stack>
                  </Box>
                )}
                </CardContent>
              </Card>
            </Box>

            {/* Transfer Comparison */}
            {selectedOutPlayerId && selectedInPlayerId && (
              <TransferComparison
                outgoingPlayerId={selectedOutPlayerId}
                incomingPlayerId={selectedInPlayerId}
                availableBudget={availableBudget}
              />
            )}

            {/* Transfer Plan Summary */}
            {currentPlan.transfers.length > 0 && (
              <TransferPlanSummary
                plan={currentPlan}
                onRemoveTransfer={handleRemoveTransfer}
                onClearPlan={handleClearPlan}
              />
            )}

            {/* Save Plan Section */}
            {currentPlan.transfers.length > 0 && (
              <Box
                sx={{
                  padding: ThemeTokens.spacing.md,
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, marginBottom: 1 }}>
                  Save This Plan
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    size="small"
                    label="Plan name"
                    placeholder="e.g. Safe GW1 move"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSavePlan}
                    disabled={!planName.trim()}
                    sx={{
                      backgroundColor: '#2196f3',
                      '&:hover': { backgroundColor: '#1976d2' },
                    }}
                  >
                    Save Plan
                  </Button>
                </Stack>
              </Box>
            )}
          </Stack>
        )}

        {/* Preview View */}
        {activeView === 'preview' && currentPlan.transfers.length > 0 && (
          <Stack spacing={ThemeTokens.spacing.lg}>
            {/* Squad Comparison Metrics */}
            {currentPlan.metrics && <SquadBeforeAfter metrics={currentPlan.metrics} />}

            {/* Planned Squad Preview */}
            <PlannedSquadPreview
              currentSquad={currentSquadData}
              transfers={currentPlan.transfers}
              planValidation={currentPlan.validation}
            />
          </Stack>
        )}

        {/* Saved Plans View */}
        {activeView === 'saved' && (
          <SavedPlansPanel
            plans={savedPlans}
            onLoadPlan={handleLoadPlan}
            onDeletePlan={(planId) => {
              planRepository.deletePlan(planId);
              setSavedPlans(planRepository.loadAllPlans());
            }}
            onRefreshPlans={() => setSavedPlans(planRepository.loadAllPlans())}
          />
        )}
        </CardContent>
      </Card>
    </Box>
  );
};
