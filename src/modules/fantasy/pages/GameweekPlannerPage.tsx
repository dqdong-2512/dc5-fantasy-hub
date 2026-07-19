/**
 * Gameweek Planner Page
 * Main page for planning lineups for a specific gameweek
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import {
  GameweekPlanService,
  GameweekPlanValidationService,
  GameweekPlanInsightService,
  GameweekPlanRepository,
  SquadSourceResolver,
} from '@modules/fantasy/services';
import { PlayerRepository } from '@repositories/players';
import { BootstrapRepository } from '@repositories/bootstrap';
import type { GameweekPlan } from '../domain/GameweekPlan';
import {
  SquadSourceSelector,
  LineupInsights,
  SavedGameweekPlans,
} from '../components/gameweek-planner';
import SaveIcon from '@mui/icons-material/Save';

export const GameweekPlannerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const gameweekParam = searchParams.get('gw');
  const gameweekId = gameweekParam ? parseInt(gameweekParam, 10) : undefined;

  // Services
  const planService = useMemo(() => new GameweekPlanService(), []);
  const validationService = useMemo(() => new GameweekPlanValidationService(), []);
  const insightService = useMemo(() => new GameweekPlanInsightService(), []);
  const repository = useMemo(() => new GameweekPlanRepository(), []);
  const sourceResolver = useMemo(() => new SquadSourceResolver(), []);
  const bootstrapRepository = useMemo(() => new BootstrapRepository(), []);
  const playerRepository = useMemo(() => new PlayerRepository(), []);

  // State
  const [availableGameweeks, setAvailableGameweeks] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [selectedGameweekId, setSelectedGameweekId] = useState<number | null>(gameweekId || null);
  const [currentPlan, setCurrentPlan] = useState<GameweekPlan | null>(null);
  const [sourceType, setSourceType] = useState<'current' | 'planned'>('current');
  const [sourceTransferPlanId, setSourceTransferPlanId] = useState<string | undefined>();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [playerPositions, setPlayerPositions] = useState<Map<number, number>>(new Map());

  // Load gameweeks
  useEffect(() => {
    try {
      const bootstrap = bootstrapRepository.getBootstrap();
      if (bootstrap?.gameweeks) {
        const gws = bootstrap.gameweeks.map((gw: any) => ({
          id: gw.id,
          name: gw.name,
        }));
        setAvailableGameweeks(gws);

        if (!selectedGameweekId && gws.length > 0) {
          setSelectedGameweekId(gws[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load gameweeks', e);
    }
  }, [bootstrapRepository, selectedGameweekId]);

  // Load player positions
  useEffect(() => {
    try {
      const allPlayers = playerRepository.getAll();
      const positions = new Map<number, number>();
      allPlayers.forEach((p) => {
        // Map Position enum to numeric position code
        // FPL uses: 1=GK, 2=DEF, 6=MID, 9=FWD (in API)
        // Domain uses: Position enum (GOALKEEPER, DEFENDER, MIDFIELDER, FORWARD)
        // We'll use numeric codes: 1=GK, 2=DEF, 6=MID, 9=FWD
        let posCode = 0;
        if (p.position === 'GOALKEEPER') {
          posCode = 1;
        } else if (p.position === 'DEFENDER') {
          posCode = 2;
        } else if (p.position === 'MIDFIELDER') {
          posCode = 6;
        } else if (p.position === 'FORWARD') {
          posCode = 9;
        }
        positions.set(p.id, posCode);
      });
      setPlayerPositions(positions);
    } catch (e) {
      console.error('Failed to load player positions', e);
    }
  }, [playerRepository]);

  // Initialize plan when gameweek changes
  useEffect(() => {
    if (!selectedGameweekId) return;

    try {
      const resolved = sourceResolver.resolveCurrentSquad();
      if (!resolved) {
        alert('Unable to load current squad');
        return;
      }

      const newPlan = planService.createPlan(
        selectedGameweekId,
        sourceType,
        sourceTransferPlanId,
        resolved.startingPlayerIds,
        resolved.benchPlayerIds,
        playerPositions
      );

      setCurrentPlan(newPlan);
      setPlanName(`GW ${selectedGameweekId} Plan`);
    } catch (e) {
      console.error('Failed to create plan', e);
    }
  }, [
    selectedGameweekId,
    sourceType,
    sourceTransferPlanId,
    sourceResolver,
    planService,
    playerRepository,
    playerPositions,
  ]);

  // Handle gameweek change
  const handleGameweekChange = (gwId: number) => {
    setSelectedGameweekId(gwId);
    setSearchParams({ gw: String(gwId) });
  };

  // Handle source change
  const handleSourceChange = (newSourceType: 'current' | 'planned', transferPlanId?: string) => {
    setSourceType(newSourceType);
    setSourceTransferPlanId(transferPlanId);
  };

  // Handle save plan
  const handleSavePlan = () => {
    if (!currentPlan || !selectedGameweekId) return;

    const planToSave: GameweekPlan = {
      ...currentPlan,
      name: planName || `GW ${selectedGameweekId} Plan`,
    };

    repository.savePlan(planToSave);
    setSaveDialogOpen(false);
    alert('Plan saved successfully!');
  };

  // Handle load plan
  const handleLoadPlan = (plan: GameweekPlan) => {
    setCurrentPlan(plan);
    setPlanName(plan.name);
  };

  // Handle delete plan
  const handleDeletePlan = (planId: string) => {
    if (!selectedGameweekId) return;
    repository.deletePlan(selectedGameweekId, planId);
  };

  // Handle rename plan
  const handleRenamePlan = (planId: string, newName: string) => {
    if (!selectedGameweekId) return;
    // Find and update plan, then save
    const plan = repository.getById(selectedGameweekId, planId);
    if (plan) {
      plan.name = newName;
      repository.savePlan(plan);
    }
  };

  // Handle duplicate plan
  const handleDuplicatePlan = (plan: GameweekPlan) => {
    const duplicate = planService.duplicatePlan(plan);
    repository.savePlan(duplicate);
    handleLoadPlan(duplicate);
  };

  // Handle reset lineup
  const handleResetLineup = () => {
    if (!currentPlan) return;
    const reset = planService.resetLineup(currentPlan);
    setCurrentPlan(reset);
  };

  if (!selectedGameweekId || !currentPlan) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ pt: ThemeTokens.spacing.xs, pb: ThemeTokens.spacing.xs }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gameweek Planner
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Select a gameweek to get started
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: ThemeTokens.spacing.xs, pb: ThemeTokens.spacing.xs }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: ThemeTokens.spacing.lg,
            flexWrap: 'wrap',
            gap: ThemeTokens.spacing.md,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Gameweek Planner
            </Typography>
            <Typography variant="body2" color="textSecondary">
              GW {selectedGameweekId}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => {
              setPlanName(`GW ${selectedGameweekId} Plan`);
              setSaveDialogOpen(true);
            }}
            disabled={!currentPlan.validation.isValid}
          >
            Save Plan
          </Button>
        </Box>

        {/* Gameweek & Source Selectors */}
        <Card sx={{ mb: ThemeTokens.spacing.lg }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={ThemeTokens.spacing.lg}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Gameweek</InputLabel>
                <Select
                  value={selectedGameweekId}
                  onChange={(e) => handleGameweekChange(Number(e.target.value))}
                  label="Gameweek"
                >
                  {availableGameweeks.map((gw) => (
                    <MenuItem key={gw.id} value={gw.id}>
                      {gw.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ flex: 1 }}>
                <SquadSourceSelector
                  sourceType={sourceType}
                  sourceTransferPlanId={sourceTransferPlanId}
                  onSourceChange={handleSourceChange}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Validation Status */}
        {!currentPlan.validation.isValid && (
          <Alert severity="error" sx={{ mb: ThemeTokens.spacing.lg }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: '4px' }}>
              {currentPlan.validation.errors.length} Validation Issues
            </Typography>
            <Stack spacing={0.5}>
              {currentPlan.validation.errors.map((err, idx) => (
                <Typography key={idx} variant="caption">
                  • {err.message}
                </Typography>
              ))}
            </Stack>
          </Alert>
        )}

        {/* Main Content Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: ThemeTokens.spacing.lg,
          }}
        >
          {/* Left Column: Insights & Captain */}
          <Stack spacing={ThemeTokens.spacing.lg}>
            <LineupInsights
              insights={insightService.generateLineupInsights(
                currentPlan.startingPlayerIds.map(
                  (id) =>
                    ({
                      playerId: id,
                      position: playerPositions.get(id) || 0,
                      isStarter: true,
                      isBench: false,
                      isCaptain: id === currentPlan.captainPlayerId,
                      isViceCaptain: id === currentPlan.viceCaptainPlayerId,
                      changedFromStarting: false,
                      form: 0,
                      totalPoints: 0,
                      pointsPerGame: 0,
                      fixtureScore: 0,
                      ownership: 0,
                      hasBlank: false,
                      doubleFixture: false,
                    }) as any
                ),
                currentPlan.benchPlayerIds.map(
                  (id) =>
                    ({
                      playerId: id,
                      position: playerPositions.get(id) || 0,
                      isStarter: false,
                      isBench: true,
                      isCaptain: false,
                      isViceCaptain: false,
                      changedFromBench: false,
                      form: 0,
                      totalPoints: 0,
                      pointsPerGame: 0,
                      fixtureScore: 0,
                      ownership: 0,
                      hasBlank: false,
                      doubleFixture: false,
                    }) as any
                ),
                currentPlan.captainPlayerId
              )}
            />

            <Card>
              <CardContent>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: ThemeTokens.spacing.md }}
                >
                  Plan Actions
                </Typography>
                <Stack spacing={ThemeTokens.spacing.sm}>
                  <Button variant="outlined" fullWidth onClick={handleResetLineup}>
                    Reset to Source
                  </Button>
                  <Button variant="outlined" fullWidth color="warning">
                    Clear All
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          {/* Right Column: Summary */}
          <Stack spacing={ThemeTokens.spacing.lg}>
            <Card>
              <CardContent>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: ThemeTokens.spacing.md }}
                >
                  Formation:{' '}
                  {validationService.getFormationLabel(
                    currentPlan.startingPlayerIds,
                    playerPositions
                  )}
                </Typography>
                <Box
                  sx={{ display: 'flex', gap: ThemeTokens.spacing.sm, mb: ThemeTokens.spacing.md }}
                >
                  <Chip
                    label={`XI: ${currentPlan.startingPlayerIds.length}`}
                    size="small"
                    variant={currentPlan.startingPlayerIds.length === 11 ? 'filled' : 'outlined'}
                  />
                  <Chip
                    label={`Bench: ${currentPlan.benchPlayerIds.length}`}
                    size="small"
                    variant={currentPlan.benchPlayerIds.length === 4 ? 'filled' : 'outlined'}
                  />
                </Box>
                <Box
                  sx={{ display: 'flex', gap: ThemeTokens.spacing.sm, mb: ThemeTokens.spacing.md }}
                >
                  <Chip
                    label={
                      currentPlan.captainPlayerId
                        ? `Captain: ${currentPlan.captainPlayerId}`
                        : 'No Captain'
                    }
                    size="small"
                    variant={currentPlan.captainPlayerId ? 'filled' : 'outlined'}
                    color={currentPlan.captainPlayerId ? 'primary' : 'default'}
                  />
                  <Chip
                    label={
                      currentPlan.viceCaptainPlayerId
                        ? `VC: ${currentPlan.viceCaptainPlayerId}`
                        : 'No VC'
                    }
                    size="small"
                    variant={currentPlan.viceCaptainPlayerId ? 'filled' : 'outlined'}
                    color={currentPlan.viceCaptainPlayerId ? 'success' : 'default'}
                  />
                </Box>
                <Box sx={{ pt: ThemeTokens.spacing.md, borderTop: '1px solid #e0e0e0' }}>
                  <Chip
                    label={currentPlan.validation.isValid ? '✓ Ready to Save' : '⚠ Has Issues'}
                    size="small"
                    color={currentPlan.validation.isValid ? 'success' : 'warning'}
                    variant="filled"
                  />
                </Box>
              </CardContent>
            </Card>

            {selectedGameweekId && (
              <SavedGameweekPlans
                gameweekId={selectedGameweekId}
                currentPlanId={currentPlan.id}
                onLoadPlan={handleLoadPlan}
                onDeletePlan={handleDeletePlan}
                onRenamePlan={handleRenamePlan}
                onDuplicatePlan={handleDuplicatePlan}
              />
            )}
          </Stack>
        </Box>

        {/* Save Dialog */}
        <Dialog
          open={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Save Gameweek Plan</DialogTitle>
          <DialogContent sx={{ pt: ThemeTokens.spacing.md }}>
            <TextField
              autoFocus
              fullWidth
              label="Plan Name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSavePlan();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePlan} variant="contained" disabled={!planName.trim()}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};
