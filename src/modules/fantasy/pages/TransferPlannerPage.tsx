/**
 * Transfer Planner Page
 * Main orchestration for transfer planning and squad optimization
 * Implements the complete workflow: select player -> find replacements -> compare -> build plan -> validate -> preview
 */

import React, { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack, Alert, Tab, Tabs } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { fantasyGameFixtures } from '../fixtures';
import { PlayerRepository } from '@repositories/players';
import { TeamRepository } from '@repositories/teams';
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

type ViewType = 'planner' | 'preview' | 'saved' | 'plans';

export const TransferPlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Services
  const playerRepo = useMemo(() => new PlayerRepository(), []);
  const teamRepo = useMemo(() => new TeamRepository(), []);
  const budgetService = useMemo(() => new TransferBudgetService(), []);
  const planService = useMemo(() => new TransferPlanService(), []);
  const planRepository = useMemo(() => new TransferPlanRepository(), []);

  // Current squad from fixtures
  const currentSquadData = useMemo((): SquadPlayer[] => {
    const squad = fantasyGameFixtures.squad || [];
    return squad.map((pick) => {
      const player = playerRepo.getById(pick.playerId);
      if (!player) {
        return {
          playerId: pick.playerId,
          position: pick.position,
          isStarter: pick.isStarter,
          benchOrder: pick.benchOrder,
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
        playerId: pick.playerId,
        position: pick.position,
        isStarter: pick.isStarter,
        benchOrder: pick.benchOrder,
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
  }, [playerRepo, teamRepo]);

  // State
  const [activeView, setActiveView] = useState<ViewType>('planner');
  const [currentPlan, setCurrentPlan] = useState<TransferPlan>(() =>
    planService.buildTransferPlan(fantasyGameFixtures.currentGameweek.gameweek, '')
  );
  const [selectedOutPlayerId, setSelectedOutPlayerId] = useState<number | null>(() => {
    const outParam = searchParams.get('out');
    return outParam ? parseInt(outParam, 10) : null;
  });
  const [selectedInPlayerId, setSelectedInPlayerId] = useState<number | null>(null);
  const [currentBank] = useState(fantasyGameFixtures.manager.bank);
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
    <Box>
      {/* Page Header */}
      <Box sx={{ padding: ThemeTokens.spacing.xs, borderBottom: '1px solid #e0e0e0' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/premier-league/gameweek')}
          sx={{
            textTransform: 'none',
            marginBottom: 1.5,
            color: '#1976d2',
            padding: 0,
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          Back to Fantasy Game
        </Button>

        <Typography variant="h5" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
          Transfer Planner
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Plan transfers - Validate squad - Preview changes
        </Typography>
      </Box>

      {/* Main Content */}
      <PageContainer sx={{ padding: ThemeTokens.spacing.xs }}>
        {/* View Tabs */}
        <Box sx={{ borderBottom: '1px solid #e0e0e0', marginBottom: ThemeTokens.spacing.md }}>
          <Tabs
            value={activeView}
            onChange={(_, value) => setActiveView(value as ViewType)}
            sx={{
              '& .MuiTab-root': {
                fontSize: '0.9rem',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: '120px',
              },
            }}
          >
            <Tab label="Planner" value="planner" />
            <Tab label="Preview" value="preview" disabled={currentPlan.transfers.length === 0} />
            <Tab label="Saved Plans" value="saved" />
          </Tabs>
        </Box>

        {/* Planner View */}
        {activeView === 'planner' && (
          <Stack spacing={ThemeTokens.spacing.md}>
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
              <Box>
                <PlayerOutSelector
                  currentSquad={currentSquadData}
                  selectedPlayerId={selectedOutPlayerId}
                  onSelect={setSelectedOutPlayerId}
                />
              </Box>

              {/* Right: Replacement Candidates */}
              <Box>
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
                      padding: ThemeTokens.spacing.md,
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      textAlign: 'center',
                    }}
                  >
                    <Typography color="textSecondary">
                      Select a player to see replacement options
                    </Typography>
                  </Box>
                )}
              </Box>
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
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <input
                    type="text"
                    placeholder="Plan name (e.g., Safe Plan)"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                    }}
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
      </PageContainer>
    </Box>
  );
};
