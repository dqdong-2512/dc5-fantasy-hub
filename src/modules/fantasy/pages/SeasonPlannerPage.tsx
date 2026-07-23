/**
 * Season Planner Page
 * Main page for long-term Fantasy Premier League planning
 * Orchestrates Season Plans, fixture analysis, chip strategy, and squad evolution
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { SeasonPlanService, SeasonPlanRepository } from '../services';
import { getBootstrapRepository } from '@repositories/index';
import type { SeasonPlan } from '../domain/SeasonPlan';
import type { BaseSquadSourceType } from '../domain/SeasonPlan';
import {
  SeasonTimelineView,
  TeamFixtureMatrix,
  SquadFixtureHeatmap,
  BGWDGWAnalysisPanel,
  ChipStrategyPanel,
  PlanningConflictsPanel,
  SeasonPlanSummaryPanel,
  SavedSeasonPlansPanel,
} from '../components/season-planner';

export const SeasonPlannerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Services
  const planService = useMemo(() => new SeasonPlanService(), []);
  const planRepository = useMemo(() => new SeasonPlanRepository(), []);

  // Derive maximum gameweek from canonical repository (not hardcoded)
  const maxGameweek = useMemo(() => {
    try {
      const bootstrapRepo = getBootstrapRepository();
      const bootstrap = bootstrapRepo.getBootstrap();
      return bootstrap.gameweeks.length > 0
        ? bootstrap.gameweeks[bootstrap.gameweeks.length - 1].id
        : 38; // Fallback only if bootstrap unavailable
    } catch {
      return 38; // Fallback only if bootstrap unavailable
    }
  }, []);

  // State
  const [currentPlan, setCurrentPlan] = useState<SeasonPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<SeasonPlan[]>(planRepository.loadAllPlans());
  const [startGameweek, setStartGameweek] = useState(34);
  const [endGameweek, setEndGameweek] = useState(maxGameweek);
  const [baseSquadSource, setBaseSquadSource] = useState<BaseSquadSourceType>('current');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [planName, setPlanName] = useState(''); // placeholder

  // Load plan from URL if specified
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      const plan = planRepository.loadPlan(planParam);
      if (plan) {
        setCurrentPlan(plan);
        setStartGameweek(plan.startGameweekId);
        setEndGameweek(plan.endGameweekId);
        setBaseSquadSource(plan.baseSquadSource);
      }
    }
  }, [searchParams, planRepository]);

  const handleCreatePlan = () => {
    if (!planName.trim()) return;

    const newPlan = planService.createSeasonPlan(
      planName,
      startGameweek,
      endGameweek,
      baseSquadSource
    );

    const saved = planService.savePlan(newPlan);
    setCurrentPlan(saved);
    setSavedPlans(planRepository.loadAllPlans());
    setCreateDialogOpen(false);
    setPlanName('');
  };

  const handleLoadPlan = (plan: SeasonPlan) => {
    setCurrentPlan(plan);
    setStartGameweek(plan.startGameweekId);
    setEndGameweek(plan.endGameweekId);
    setBaseSquadSource(plan.baseSquadSource);
    setSearchParams({ plan: plan.id });
  };

  const handleSavePlan = () => {
    if (currentPlan) {
      const updated = planService.savePlan(currentPlan);
      setCurrentPlan(updated);
      setSavedPlans(planRepository.loadAllPlans());
    }
  };

  const handleDeletePlan = (planId: string) => {
    planRepository.deletePlan(planId);
    setSavedPlans(planRepository.loadAllPlans());
    if (currentPlan?.id === planId) {
      setCurrentPlan(null);
      setSearchParams({});
    }
  };

  const handleBack = () => {
    setCurrentPlan(null);
    setSearchParams({});
  };

  if (!currentPlan) {
    // Show plan selection/creation view
    return (
      <PageContainer maxWidth="lg">
        <Box sx={{ pt: ThemeTokens.spacing.xs, pb: ThemeTokens.spacing.xs }}>
          <Stack
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Season Planner & Chip Strategy
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              New Plan
            </Button>
          </Stack>

          <SavedSeasonPlansPanel
            plans={savedPlans}
            onLoadPlan={handleLoadPlan}
            onDeletePlan={handleDeletePlan}
          />

          {/* Create Plan Dialog */}
          <Dialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Create New Season Plan</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={2}>
                <TextField
                  label="Plan Name"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g., GW35-38 Attack"
                  fullWidth
                  autoFocus
                />

                <FormControl fullWidth>
                  <InputLabel>Start Gameweek</InputLabel>
                  <Select
                    value={startGameweek}
                    onChange={(e) => setStartGameweek(e.target.value as number)}
                    label="Start Gameweek"
                  >
                    {Array.from({ length: 35 }, (_, i) => i + 1).map((gw) => (
                      <MenuItem key={gw} value={gw}>
                        GW{gw}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>End Gameweek</InputLabel>
                  <Select
                    value={endGameweek}
                    onChange={(e) => setEndGameweek(e.target.value as number)}
                    label="End Gameweek"
                  >
                    {Array.from({ length: 38 }, (_, i) => i + 1)
                      .filter((gw) => gw >= startGameweek)
                      .map((gw) => (
                        <MenuItem key={gw} value={gw}>
                          GW{gw}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Base Squad Source</InputLabel>
                  <Select
                    value={baseSquadSource}
                    onChange={(e) => setBaseSquadSource(e.target.value as BaseSquadSourceType)}
                    label="Base Squad Source"
                  >
                    <MenuItem value="current">Current Squad</MenuItem>
                    <MenuItem value="active_planned">Active Planned Squad</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreatePlan} variant="contained" disabled={!planName.trim()}>
                Create
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </PageContainer>
    );
  }

  // Show plan editor
  return (
    <PageContainer maxWidth="lg">
      <Box sx={{ pt: ThemeTokens.spacing.xs, pb: ThemeTokens.spacing.xs }}>
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Stack sx={{ flexDirection: 'row', spacing: 2, alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              variant="outlined"
              size="small"
            >
              Back
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {currentPlan.name}
            </Typography>
            <Chip
              label={`GW${currentPlan.startGameweekId}-${currentPlan.endGameweekId}`}
              size="small"
              variant="outlined"
            />
          </Stack>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSavePlan}>
            Save
          </Button>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          {/* Main planning view */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <SeasonTimelineView plan={currentPlan} onPlanChange={setCurrentPlan} />
          </Box>

          {/* Summary and analysis panels */}
          <SeasonPlanSummaryPanel plan={currentPlan} />
          <PlanningConflictsPanel plan={currentPlan} />

          {/* Fixture and chip analysis */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TeamFixtureMatrix plan={currentPlan} />
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <SquadFixtureHeatmap />
          </Box>

          <BGWDGWAnalysisPanel plan={currentPlan} />
          <ChipStrategyPanel plan={currentPlan} onPlanChange={setCurrentPlan} />
        </Box>
      </Box>
    </PageContainer>
  );
};
