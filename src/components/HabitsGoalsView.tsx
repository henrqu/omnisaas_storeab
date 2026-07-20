/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  Target, 
  Flame, 
  TrendingUp, 
  Award, 
  ShieldAlert, 
  Clock, 
  FolderHeart,
  PlusCircle,
  HelpCircle,
  Printer,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { LocalDatabase } from '../utils/db';
import { Habit, Goal } from '../types/schema';
import DailyPlannerView from './DailyPlannerView';
import { useLanguageTheme } from '../utils/i18n';

export interface HabitTrackerRow {
  category: string;
  days: boolean[];
}

export const HABIT_TRACKER_CATEGORIES = [
  'Daily Tracker',
  'Monthly Tracker',
  'Streak Tracker',
  'Goal Tracker',
  'Mood Tracker',
  'Sleep Tracker',
  'Water Tracker',
  'Workout Tracker',
  'Reading Tracker',
  'Productivity Tracker'
];

interface HabitsGoalsViewProps {
  onShowNotification: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export default function HabitsGoalsView({ onShowNotification }: HabitsGoalsViewProps) {
  const { t, language } = useLanguageTheme();
  const [activeSubView, setActiveSubView] = useState<'standard' | 'habit-sheet' | 'daily-planner'>('standard');
  const [trackerMonth, setTrackerMonth] = useState(t('defaultMonth', 'Julho'));
  const [trackerYear, setTrackerYear] = useState('2026');
  const [trackerNotes, setTrackerNotes] = useState('');
  
  const [trackerGrid, setTrackerGrid] = useState<HabitTrackerRow[]>(() => {
    const saved = localStorage.getItem('omnisaas_habit_tracker_grid');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === HABIT_TRACKER_CATEGORIES.length) {
          return parsed;
        }
      } catch (e) {}
    }
    return HABIT_TRACKER_CATEGORIES.map(cat => ({
      category: cat,
      days: Array.from({ length: 31 }, () => false)
    }));
  });

  useEffect(() => {
    localStorage.setItem('omnisaas_habit_tracker_grid', JSON.stringify(trackerGrid));
  }, [trackerGrid]);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Form states & validation
  const [habitName, setHabitName] = useState('');
  const [habitFreq, setHabitFreq] = useState<'daily' | 'weekly'>('daily');
  const [habitError, setHabitError] = useState('');

  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalUnit, setGoalUnit] = useState('R$');
  const [goalCategory, setGoalCategory] = useState<'personal' | 'fitness' | 'business' | 'financial'>('business');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalError, setGoalError] = useState('');

  const [adjustingGoalId, setAdjustingGoalId] = useState<string | null>(null);
  const [goalNewValue, setGoalNewValue] = useState('');

  useEffect(() => {
    setHabits(LocalDatabase.getHabits());
    setGoals(LocalDatabase.getGoals());
  }, []);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) {
      setHabitError(t('habitNameRequired', 'Por favor, informe o nome do hábito.'));
      return;
    }
    setHabitError('');

    const newHabit = LocalDatabase.addHabit(habitName.trim(), habitFreq);
    setHabits(LocalDatabase.getHabits());
    setHabitName('');
    onShowNotification(
      t('habitRegisteredTitle', 'Hábito Cadastrado'), 
      t('habitRegisteredMessage', '"{name}" foi registrado com sucesso!').replace('{name}', newHabit.name), 
      'success'
    );
  };

  const handleToggleHabit = (id: string) => {
    const updated = LocalDatabase.toggleHabit(id);
    setHabits(updated);
    const target = updated.find(h => h.id === id);
    if (target?.last_completed) {
      onShowNotification(
        t('habitCompletedCongratsTitle', 'Sensacional!'), 
        t('habitCompletedCongratsMessage', 'Você completou o hábito "{name}". Streak de {streak} dias!').replace('{name}', target.name).replace('{streak}', String(target.streak)), 
        'success'
      );
    }
  };

  const handleDeleteHabit = (id: string, name: string) => {
    const updated = LocalDatabase.deleteHabit(id);
    setHabits(updated);
    onShowNotification(
      t('habitDeletedTitle', 'Hábito Removido'), 
      t('habitDeletedMessage', '"{name}" foi apagado permanentemente.').replace('{name}', name), 
      'info'
    );
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) {
      setGoalError(t('goalNameRequired', 'O nome da meta é obrigatório.'));
      return;
    }
    const targetNum = parseFloat(goalTarget);
    if (isNaN(targetNum) || targetNum <= 0) {
      setGoalError(t('goalTargetInvalid', 'O valor alvo deve ser um número positivo.'));
      return;
    }
    if (!goalDeadline) {
      setGoalError(t('goalDeadlineRequired', 'Por favor, insira uma data limite de prazo.'));
      return;
    }
    setGoalError('');

    const newGoal = LocalDatabase.addGoal({
      name: goalName.trim(),
      target_value: targetNum,
      current_value: 0,
      unit: goalUnit,
      deadline: goalDeadline,
      category: goalCategory,
    });

    setGoals(LocalDatabase.getGoals());
    setGoalName('');
    setGoalTarget('');
    setGoalDeadline('');
    onShowNotification(
      t('goalCreatedTitle', 'Objetivo Criado'), 
      t('goalCreatedMessage', 'Meta "{name}" estabelecida com sucesso!').replace('{name}', newGoal.name), 
      'success'
    );
  };

  const handleUpdateGoalVal = (id: string) => {
    const val = parseFloat(goalNewValue);
    if (isNaN(val) || val < 0) {
      onShowNotification(
        t('goalProgressInvalidTitle', 'Erro de Validação'), 
        t('invalidNumberValue', 'Informe um valor numérico positivo ou zero.'), 
        'warning'
      );
      return;
    }

    const updated = LocalDatabase.updateGoalProgress(id, val);
    setGoals(updated);
    setAdjustingGoalId(null);
    setGoalNewValue('');

    const matched = updated.find(g => g.id === id);
    if (matched && matched.status === 'completed') {
      onShowNotification(
        t('goalAchievedTitle', 'Meta Atingida! 🏆'), 
        t('goalAchievedMessage', 'Parabéns! Você alcançou o objetivo "{name}"!').replace('{name}', matched.name), 
        'success'
      );
    } else {
      onShowNotification(
        t('goalProgressSavedTitle', 'Progresso Salvo'), 
        t('goalProgressSavedMessage', 'Progresso de "{name}" atualizado para {val}.').replace('{name}', matched?.name || '').replace('{val}', String(val)), 
        'success'
      );
    }
  };

  const handleDeleteGoal = (id: string, name: string) => {
    const updated = LocalDatabase.deleteGoal(id);
    setGoals(updated);
    onShowNotification(
      t('goalCancelledTitle', 'Meta Cancelada'), 
      t('goalCancelledMessage', '"{name}" foi excluída.').replace('{name}', name), 
      'info'
    );
  };

  const handlePrintHabitTracker = (month: string, year: string, grid: HabitTrackerRow[], notes: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      onShowNotification('Aviso', 'Habilite popups no seu navegador para imprimir.', 'warning');
      return;
    }

    const renderHeaders = () => {
      let headers = '<th style="border: 1px solid black; padding: 6px; text-align: left; font-size: 11px;">Hábito / Categoria</th>';
      for (let d = 1; d <= 31; d++) {
        headers += `<th style="border: 1px solid black; padding: 2px; text-align: center; font-size: 9px; width: 18px; font-family: sans-serif;">${d}</th>`;
      }
      headers += '<th style="border: 1px solid black; padding: 4px; text-align: center; font-size: 9px; width: 40px; font-family: sans-serif;">Total</th>';
      return headers;
    };

    const renderRows = () => {
      return grid.map(row => {
        let cells = `<td style="border: 1px solid black; padding: 6px; font-weight: bold; text-align: left; font-size: 11px; font-family: sans-serif;">${row.category}</td>`;
        let count = 0;
        for (let d = 0; d < 31; d++) {
          const checked = row.days[d];
          if (checked) count++;
          cells += `
            <td style="border: 1px solid black; padding: 0; text-align: center; font-size: 11px; width: 18px; height: 22px; font-weight: bold; background-color: ${checked ? '#cbd5e1' : 'transparent'};">
              ${checked ? '●' : ''}
            </td>
          `;
        }
        cells += `<td style="border: 1px solid black; padding: 4px; text-align: center; font-size: 10px; font-family: monospace; font-weight: bold;">${count}</td>`;
        return `<tr>${cells}</tr>`;
      }).join('');
    };

    printWindow.document.write(`
      <html>
        <head>
          <title>HABIT TRACKER - ${month.toUpperCase()} ${year}</title>
          <style>
            @media print {
              body { background-color: white !important; color: black !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
            }
            body {
              font-family: 'Georgia', serif;
              color: #111;
              background-color: #FAF8F5;
              padding: 40px;
              max-width: 950px;
              margin: 0 auto;
              border: 1px solid #ddd;
              box-shadow: 0 0 10px rgba(0,0,0,0.05);
            }
            h1 {
              font-size: 26px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 3px;
              text-align: center;
              margin-bottom: 5px;
              font-family: 'Times New Roman', Times, serif;
            }
            .subtitle {
              text-align: center;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #555;
              margin-bottom: 25px;
            }
            .header-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              border-bottom: 1px solid black;
              padding-bottom: 8px;
              font-family: sans-serif;
              font-size: 12px;
            }
            .info-item {
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            th, td {
              border: 1px solid black;
              height: 22px;
            }
            th {
              background-color: #f3f3f3;
              font-family: sans-serif;
              font-weight: bold;
            }
            .notes-section {
              margin-top: 25px;
              text-align: left;
            }
            .notes-title {
              font-family: sans-serif;
              font-weight: bold;
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            .notes-lines {
              border: 1px solid black;
              background-color: transparent;
              min-height: 80px;
              padding: 10px;
              font-size: 11px;
              font-family: 'Georgia', serif;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <h1>Habit Tracker</h1>
          <div class="subtitle">Daily Routines & Discipline Sheet</div>
          
          <div class="header-info">
            <div><span class="info-item">Month/Mês:</span> ${month || '&nbsp;'}</div>
            <div><span class="info-item">Year/Ano:</span> ${year || '&nbsp;'}</div>
          </div>
          
          <table>
            <thead>
              <tr>${renderHeaders()}</tr>
            </thead>
            <tbody>
              ${renderRows()}
            </tbody>
          </table>
          
          <div class="notes-section">
            <div class="notes-title">Notes & Reflection</div>
            <div class="notes-lines">${notes.replace(/\n/g, '<br>') || 'Escreva suas reflexões, aprendizados e conquistas do mês...'}</div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    onShowNotification('Sucesso', 'Visualização de impressão aberta!', 'success');
  };

  const handleToggleCell = (rowIndex: number, dayIndex: number) => {
    setTrackerGrid(prev => {
      const updated = [...prev];
      const updatedRow = { ...updated[rowIndex] };
      const updatedDays = [...updatedRow.days];
      updatedDays[dayIndex] = !updatedDays[dayIndex];
      updatedRow.days = updatedDays;
      updated[rowIndex] = updatedRow;
      return updated;
    });
  };

  const handlePrefillTracker = () => {
    setTrackerGrid(prev => {
      return prev.map((row, idx) => {
        const days = Array.from({ length: 31 }, (_, dayIdx) => {
          // Pre-fill some days randomly but with a nice realistic pattern (more checked items in first half of month)
          const prob = idx % 2 === 0 ? 0.7 - (dayIdx * 0.01) : 0.4 + (dayIdx * 0.005);
          return Math.random() < prob;
        });
        return { ...row, days };
      });
    });
    setTrackerNotes(t('prefillNotesText', 'Foco absoluto este mês! Excelente progresso na leitura diária e hidratação.'));
    onShowNotification(t('success', 'Sucesso'), t('prefillDataSuccess', 'Dados preenchidos para visualização!'), 'success');
  };

  return (
    <div className="space-y-6" id="habits-goals-container-outer">
      
      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-slate-850 overflow-x-auto scrollbar-none" id="habits-sub-tabs">
        <button 
          onClick={() => setActiveSubView('standard')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 shrink-0 ${
            activeSubView === 'standard' 
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
          id="tab-btn-standard-habits"
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>{t('habitsGoalsTab', 'Controle de Metas & Rotina')}</span>
        </button>

        <button 
          onClick={() => setActiveSubView('habit-sheet')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 shrink-0 ${
            activeSubView === 'habit-sheet' 
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
          id="tab-btn-sheet-habits"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t('habitsSheetTab', 'Folha Habit Tracker Impressa')}</span>
        </button>

        <button 
          onClick={() => setActiveSubView('daily-planner')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 shrink-0 ${
            activeSubView === 'daily-planner' 
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
          id="tab-btn-daily-planner"
        >
          <Calendar className="w-3.5 h-3.5 text-pink-400" />
          <span className="flex items-center">{t('habitsDailyTab', 'Hábitos Diários')} <span className="ml-1 text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-800 px-1.5 py-0.2 rounded font-mono font-bold">20 Seções</span></span>
        </button>
      </div>

      {activeSubView === 'standard' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="habits-goals-container">
          
          {/* Coluna Esquerda: Hábitos (2/3 de espaço se tela larga) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Painel de Lista de Hábitos */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6" id="habits-list-section">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center">
                    <Flame className="w-5 h-5 mr-1.5 text-orange-500 fill-orange-500/20" />
                    {t('habitsPerfTitle', 'Seus Hábitos de Performance')}
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">{t('habitsPerfDesc', 'Construa disciplina diária com metas de repetição constante.')}</p>
                </div>
                <span className="bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {t('habitsProgressToday', '{count} de {total} feitos hoje')
                    .replace('{count}', String(habits.filter(h => h.last_completed === new Date().toISOString().split('T')[0]).length))
                    .replace('{total}', String(habits.length))}
                </span>
              </div>

              <div className="grid gap-3" id="habits-items-grid">
                {habits.map((habit) => {
                  const today = new Date().toISOString().split('T')[0];
                  const isCompleted = habit.last_completed === today;
                  return (
                    <div 
                      key={habit.id} 
                      className={`flex items-center justify-between p-4 rounded-xl border transition ${
                        isCompleted 
                          ? 'bg-emerald-950/10 border-emerald-900/30 text-slate-400' 
                          : 'bg-slate-800/20 border-slate-800/60 hover:border-slate-700 text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        {/* Botão de Checkoff */}
                        <button 
                          onClick={() => handleToggleHabit(habit.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                            isCompleted 
                              ? 'bg-emerald-500 border-emerald-400 text-white shadow-md' 
                              : 'border-slate-700 hover:border-slate-600 text-transparent bg-slate-900/40'
                          }`}
                          id={`habit-check-btn-${habit.id}`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                        <div>
                          <p className={`text-sm font-semibold tracking-tight truncate max-w-[200px] md:max-w-md ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {habit.name}
                          </p>
                          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                            {habit.frequency === 'daily' ? t('daily', 'Diário') : t('weekly', 'Semanal')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Streak Badge */}
                        <div className="flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
                          <Flame className={`w-3.5 h-3.5 ${habit.streak > 0 ? 'text-orange-400 fill-orange-500' : 'text-slate-500'}`} />
                          <span className="font-bold text-slate-300">{habit.streak}d</span>
                        </div>

                        {/* Lixeira */}
                        <button 
                          onClick={() => handleDeleteHabit(habit.id, habit.name)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/60 transition"
                          title={t('deleteHabitTooltip', 'Excluir hábito')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {habits.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                    <FolderHeart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-300">{t('habitsEmptyTitle', 'Nenhum hábito cadastrado')}</h3>
                    <p className="text-slate-500 text-xs mt-1">{t('habitsEmptyDesc', 'Crie hábitos saudáveis ao lado para iniciar seu acompanhamento diário.')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Formulário Novo Hábito */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5" id="habits-form-panel">
              <h3 className="text-sm font-bold text-white tracking-tight mb-4 flex items-center">
                <PlusCircle className="w-4 h-4 mr-1.5 text-indigo-400" />
                {t('addNewHabitTitle', 'Adicionar Novo Hábito')}
              </h3>
              <form onSubmit={handleAddHabit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder={t('habitNamePlaceholder', 'Ex: Ler 15 páginas, Fazer ioga, Codar...')} 
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    id="input-habit-name"
                  />
                </div>
                <div className="w-full sm:w-40">
                  <select 
                    value={habitFreq}
                    onChange={(e) => setHabitFreq(e.target.value as 'daily' | 'weekly')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="daily">{t('dailyRepetition', 'Repetição Diária')}</option>
                    <option value="weekly">{t('weekly', 'Semanal')}</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2 rounded-xl transition flex items-center justify-center space-x-1 shadow-md shadow-indigo-950/30"
                  id="submit-habit-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('saveBtn', 'Salvar')}</span>
                </button>
              </form>
              {habitError && (
                <p className="text-rose-400 text-xs mt-2 flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  {habitError}
                </p>
              )}
            </div>

          </div>

          {/* Coluna Direita: Metas e Objetivos (1/3 de espaço) */}
          <div className="space-y-6">
            
            {/* Formulário Novo Objetivo */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6" id="goals-form-panel">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center">
                  <Target className="w-4 h-4 mr-1.5 text-indigo-400" />
                  {t('goalsAddTitle', 'Estipular Meta Estratégica')}
                </h2>
                <p className="text-slate-400 text-[11px] mt-0.5">{t('goalsAddDesc', 'Defina alvos mensuráveis com prazos reais.')}</p>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-4 mt-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('goalNameLabel', 'Nome do Objetivo')}</label>
                  <input 
                    type="text"
                    placeholder={t('goalNamePlaceholder', 'Ex: Atingir R$ 20k de MRR')}
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                    id="input-goal-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('goalTargetLabel', 'Valor Alvo')}</label>
                    <input 
                      type="number"
                      placeholder="20000"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('goalUnitLabel', 'Unidade')}</label>
                    <input 
                      type="text"
                      placeholder="R$, kg, km"
                      value={goalUnit}
                      onChange={(e) => setGoalUnit(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('goalCategoryLabel', 'Categoria')}</label>
                    <select 
                      value={goalCategory}
                      onChange={(e) => setGoalCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="business">{t('business', 'Corporativo')}</option>
                      <option value="financial">{t('financial', 'Financeiro')}</option>
                      <option value="fitness">{t('fitness', 'Fitness / Saúde')}</option>
                      <option value="personal">{t('personal', 'Pessoal')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('goalDeadlineLabel', 'Prazo Limite')}</label>
                    <input 
                      type="date"
                      value={goalDeadline}
                      onChange={(e) => setGoalDeadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 rounded-xl transition"
                  id="submit-goal-btn"
                >
                  {t('goalsSubmitBtn', 'Criar Meta')}
                </button>

                {goalError && (
                  <p className="text-rose-400 text-xs flex items-center">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                    {goalError}
                  </p>
                )}
              </form>
            </div>

            {/* Painel de Lista de Metas */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 space-y-4" id="goals-list-panel">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center">
                <Award className="w-4 h-4 mr-1.5 text-emerald-400" />
                {t('goalsActiveTitle', 'Seus Objetivos Ativos')}
              </h2>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {goals.map((g) => {
                  const progress = Math.min(100, (g.current_value / g.target_value) * 100);
                  const isFinished = g.status === 'completed';
                  return (
                    <div key={g.id} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div className="truncate pr-2">
                          <p className={`text-xs font-bold text-slate-200 truncate ${isFinished ? 'line-through text-slate-500' : ''}`} title={g.name}>{g.name}</p>
                          <span className="text-[9px] bg-slate-800/80 text-slate-400 border border-slate-700/50 px-2 py-0.5 rounded-full capitalize mt-1 inline-block">
                            {t(g.category, g.category)}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeleteGoal(g.id, g.name)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{t('goalProgressRatio', 'Progresso: {ratio}%').replace('{ratio}', progress.toFixed(0))}</span>
                          <span>{g.current_value} / {g.target_value} {g.unit}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isFinished ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Deadline & Adjust actions */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/50">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-0.5 text-slate-600" />
                          {t('goalDeadlineText', 'Prazo: {date}').replace('{date}', g.deadline)}
                        </span>
                        
                        {adjustingGoalId === g.id ? (
                          <div className="flex items-center space-x-1">
                            <input 
                              type="number"
                              placeholder="Valor"
                              value={goalNewValue}
                              onChange={(e) => setGoalNewValue(e.target.value)}
                              className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-200"
                            />
                            <button 
                              onClick={() => handleUpdateGoalVal(g.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white p-0.5 rounded"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setAdjustingGoalId(g.id);
                              setGoalNewValue(g.current_value.toString());
                            }}
                            className="text-indigo-405 hover:text-indigo-300 font-semibold"
                            id={`goal-adjust-btn-${g.id}`}
                          >
                            {t('goalAdjustBtn', 'Ajustar Valor')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {goals.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">{t('goalsEmptyTitle', 'Nenhum objetivo ativo estabelecido.')}</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeSubView === 'habit-sheet' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in" id="habit-sheet-view">
          {/* Sidebar Controller */}
          <div className="xl:col-span-1 bg-slate-900/30 border border-slate-800 rounded-2xl p-4 h-fit">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">{t('habitSheetTitle', 'Folha Habit Tracker')}</h3>
            <p className="text-slate-400 text-xs mb-4">
              {t('habitSheetDesc', 'Gerencie seus hábitos diários em uma grade de 31 dias. Clique em cada dia para preencher sua bolinha de conclusão.')}
            </p>
            
            <div className="space-y-2 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => handlePrintHabitTracker(trackerMonth, trackerYear, trackerGrid, trackerNotes)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition"
              >
                <Printer className="w-4 h-4 text-emerald-405" />
                <span>{t('printSheetBtn', 'Imprimir Folha / PDF')}</span>
              </button>
              
              <button
                onClick={handlePrefillTracker}
                className="w-full bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-300 text-xs font-semibold py-2 px-3 rounded-xl transition"
              >
                {t('prefillSampleBtn', 'Preencher Amostra')}
              </button>

              <button
                onClick={() => {
                  if (confirm(t('confirmResetGrid', 'Tem certeza de que deseja resetar toda a sua folha de hábitos?'))) {
                    setTrackerGrid(HABIT_TRACKER_CATEGORIES.map(cat => ({
                      category: cat,
                      days: Array.from({ length: 31 }, () => false)
                    })));
                    setTrackerNotes('');
                    onShowNotification(t('success', 'Sucesso'), t('gridResetSuccess', 'Grade de hábitos resetada!'), 'info');
                  }
                }}
                className="w-full bg-slate-950 hover:bg-slate-900 text-rose-400 border border-rose-500/10 hover:border-rose-500/20 text-xs font-medium py-2 px-3 rounded-xl transition"
              >
                {t('clearGridBtn', 'Limpar Grade')}
              </button>
            </div>
          </div>

          {/* Habit Paper Sheet */}
          <div className="xl:col-span-3">
            <div className="bg-[#FAF8F5] border border-slate-300 p-6 md:p-8 rounded-xl shadow-xl text-slate-900 max-w-5xl mx-auto font-serif min-h-[850px] flex flex-col justify-between">
              <div>
                <div className="text-center pb-3 border-b border-black">
                  <p className="text-[10px] font-sans font-bold tracking-widest text-slate-500 uppercase">Interactive Journal</p>
                  <h2 className="text-3xl font-black tracking-widest text-black uppercase mt-1" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    Daily Habit Tracker
                  </h2>
                </div>

                {/* Header Metadata inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-5 px-1 font-sans text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-black uppercase">Month/Mês:</span>
                    <input 
                      type="text" 
                      value={trackerMonth} 
                      onChange={(e) => setTrackerMonth(e.target.value)}
                      className="bg-transparent border-b border-black text-slate-900 text-sm focus:outline-none flex-1 font-medium"
                      placeholder="Ex: Julho"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-black uppercase">Year/Ano:</span>
                    <input 
                      type="text" 
                      value={trackerYear} 
                      onChange={(e) => setTrackerYear(e.target.value)}
                      className="bg-transparent border-b border-black text-slate-900 text-sm focus:outline-none flex-1 font-medium"
                      placeholder="Ex: 2026"
                    />
                  </div>
                </div>

                {/* 31-Day Table */}
                <div className="overflow-x-auto border border-black mt-6">
                  <table className="w-full text-center border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-200/50 border-b border-black text-[10px] font-sans font-bold uppercase tracking-wider">
                        <th className="py-2 px-3 border-r border-black text-left w-[18%]">{t('habitCategoryHeader', 'Hábito / Categoria')}</th>
                        {Array.from({ length: 31 }).map((_, d) => (
                          <th key={d} className="border-r border-black font-sans font-bold w-[2.2%] text-center">{d + 1}</th>
                        ))}
                        <th className="py-2 px-1 text-center w-[6%]">{t('total', 'Total')}</th>
                        <th className="py-2 px-1 text-center w-[8%]">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {trackerGrid.map((row, rIdx) => {
                        const checkedCount = row.days.filter(Boolean).length;
                        const percentage = ((checkedCount / 31) * 100).toFixed(0);
                        return (
                          <tr key={rIdx} className="hover:bg-black/5 divide-x divide-black">
                            <td className="py-2 px-3 text-left font-sans font-bold text-black text-[11px] bg-slate-100/10">
                              {row.category}
                            </td>
                            {row.days.map((checked, dIdx) => (
                              <td 
                                key={dIdx} 
                                onClick={() => handleToggleCell(rIdx, dIdx)}
                                className="p-0 align-middle cursor-pointer hover:bg-slate-300/30 transition-all select-none"
                              >
                                <div className="flex items-center justify-center h-7 w-full">
                                  <div className={`w-3 h-3 rounded-full border border-black/80 flex items-center justify-center transition-all ${
                                    checked ? 'bg-slate-900 scale-110 shadow-sm' : 'bg-transparent'
                                  }`} />
                                </div>
                              </td>
                            ))}
                            <td className="py-2 font-mono text-[11px] font-bold text-slate-900 bg-slate-100/5 align-middle">
                              {checkedCount}
                            </td>
                            <td className="py-2 font-mono text-[10px] font-bold text-indigo-700 bg-slate-100/5 align-middle">
                              {percentage}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lined Notes section at the bottom */}
              <div className="mt-8 border-t border-black/30 pt-6">
                <label className="block text-xs font-sans font-bold text-black uppercase tracking-wider mb-2">
                  {t('notesReflection', 'Notes & Reflection (Anotações e Reflexões)')}
                </label>
                <textarea
                  value={trackerNotes}
                  onChange={(e) => setTrackerNotes(e.target.value)}
                  className="w-full bg-transparent border border-black rounded-sm p-4 text-xs font-serif leading-relaxed text-slate-900 focus:outline-none focus:bg-white"
                  placeholder={t('notesReflectionPlaceholder', 'Escreva suas reflexões, metas e aprendizados do mês aqui...')}
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'daily-planner' && (
        <DailyPlannerView onShowNotification={onShowNotification} />
      )}

    </div>
  );
}
