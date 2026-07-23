/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  AlertTriangle, 
  CheckCircle, 
  PlusCircle, 
  PiggyBank, 
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  BrainCircuit
} from 'lucide-react';
import { LocalDatabase } from '../utils/db';
import { Transaction, Budget } from '../types/schema';
import { useLanguageTheme, formatCurrency } from '../utils/i18n';
import PaycheckPlannerView from './PaycheckPlannerView';
import CategoryDashboard from './CategoryDashboard';
import CardManagementView from './CardManagementView';

interface FinanceViewProps {
  onShowNotification: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

interface ExcelRow {
  id: string;
  description: string;
  category: string;
  planned: number;
  actual: number;
  status: 'Pendente' | 'Concluído';
  notes: string;
}

export interface PlannerItem {
  date: string;
  description: string;
  amount: number;
}

export interface PlannerSheet {
  budgetGoal: string;
  month: string;
  income: PlannerItem[];
  fixedExpenses: PlannerItem[];
  otherExpenses: PlannerItem[];
  bills: PlannerItem[];
  recapGoals: {
    earnt: number;
    spent: number;
    debt: number;
    saved: number;
  };
}

export const PLANNER_CATEGORIES = [
  'Monthly Budget',
  'Expense Tracker',
  'Income Tracker',
  'Bills Tracker',
  'Savings Tracker',
  'Debt Tracker',
  'Net Worth Tracker',
  'Subscription Tracker',
  'Cash Flow Tracker',
  'Financial Goals Tracker'
];

const DEFAULT_PLANNER_SHEET = (): PlannerSheet => ({
  budgetGoal: '',
  month: '',
  income: Array.from({ length: 8 }, () => ({ date: '', description: '', amount: 0 })),
  fixedExpenses: Array.from({ length: 8 }, () => ({ date: '', description: '', amount: 0 })),
  otherExpenses: Array.from({ length: 8 }, () => ({ date: '', description: '', amount: 0 })),
  bills: Array.from({ length: 8 }, () => ({ date: '', description: '', amount: 0 })),
  recapGoals: {
    earnt: 0,
    spent: 0,
    debt: 0,
    saved: 0
  }
});

export default function FinanceView({ onShowNotification }: FinanceViewProps) {
  const { t, language, currency } = useLanguageTheme();
  const currencySymbol = currency === 'BRL' ? 'R$' : currency === 'EUR' ? '€' : '$';
  const [activeTab, setActiveTab] = useState<'cards' | 'paycheck-planner' | 'transactions' | 'budgets' | 'excel-budget' | 'planner-universal'>('cards');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const handleExport = (type: 'excel' | 'pdf' | 'docs' | 'print') => {
    const title = 'Planilha de Planejamento Orçamentário (I Love Mi)';
    if (type === 'excel') {
      const headers = ['Ref', 'Descrição', 'Categoria de Vida', 'Valor Planejado', 'Valor Real', 'Diferença', 'Status', 'Anotações/Observações'];
      const csvRows = [headers.join(",")];
      excelRows.forEach((row, i) => {
        const ref = String.fromCharCode(65 + (i % 26)) + (i + 1);
        const diff = row.planned - row.actual;
        csvRows.push([
          ref,
          `"${row.description.replace(/"/g, '""')}"`,
          `"${row.category}"`,
          row.planned,
          row.actual,
          diff,
          row.status,
          `"${row.notes.replace(/"/g, '""')}"`
        ].join(","));
      });
      const blob = new Blob(["\ufeff" + csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `planilha_financeira_i_love_mi.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowNotification('Sucesso', 'Planilha exportada com sucesso em formato Excel!', 'success');
    } else if (type === 'docs') {
      const docContent = `\ufeff===============================================\n`
        + `${title.toUpperCase()}\n`
        + `===============================================\n\n`
        + excelRows.map((row, i) => {
          const ref = String.fromCharCode(65 + (i % 26)) + (i + 1);
          return `[${ref}] ${row.description}\n`
            + `   - Categoria: ${row.category}\n`
            + `   - Planejado: ${formatCurrency(row.planned, language)}\n`
            + `   - Real: ${formatCurrency(row.actual, language)}\n`
            + `   - Status: ${row.status}\n`
            + `   - Notas: ${row.notes || 'N/A'}\n`;
        }).join("\n");
      const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `relatorio_planejamento_i_love_mi.doc`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowNotification('Sucesso', 'Relatório exportado com sucesso em formato DOCS!', 'success');
    } else if (type === 'print' || type === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: sans-serif; padding: 20px; color: #111; }
                h1 { border-bottom: 2px solid #ccc; padding-bottom: 10px; font-size: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
              </style>
            </head>
            <body>
              <h1>${title}</h1>
              <p>Relatório gerado em ${new Date().toLocaleDateString()}</p>
              <table>
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th class="text-right">Valor Planejado</th>
                    <th class="text-right">Valor Real</th>
                    <th class="text-right">Diferença</th>
                    <th class="text-center">Status</th>
                    <th>Anotações</th>
                  </tr>
                </thead>
                <tbody>
                  ${excelRows.map((row, i) => {
                    const ref = String.fromCharCode(65 + (i % 26)) + (i + 1);
                    const diff = row.planned - row.actual;
                    return `
                      <tr>
                        <td class="text-center font-bold">${ref}</td>
                        <td>${row.description}</td>
                        <td>${row.category}</td>
                        <td class="text-right">${formatCurrency(row.planned, language)}</td>
                        <td class="text-right">${formatCurrency(row.actual, language)}</td>
                        <td class="text-right font-bold">${diff >= 0 ? '+' : ''}${formatCurrency(diff, language)}</td>
                        <td class="text-center">${row.status}</td>
                        <td>${row.notes || ''}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
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
        onShowNotification('Sucesso', type === 'pdf' ? 'Aberto diálogo de salvamento em PDF!' : 'Diálogo de impressão aberto!', 'success');
      } else {
        onShowNotification('Aviso', 'Por favor, habilite popups no seu navegador para exportar.', 'warning');
      }
    }
  };

  const handlePrintPlanner = (category: string, sheet: PlannerSheet) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      onShowNotification('Aviso', 'Habilite popups no seu navegador para imprimir.', 'warning');
      return;
    }
    
    // Calculate sums
    const sumIncome = sheet.income.reduce((sum, item) => sum + (item.amount || 0), 0);
    const sumFixed = sheet.fixedExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const sumOther = sheet.otherExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const sumBills = sheet.bills.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    const actualSpent = sumFixed + sumOther + sumBills;
    const actualDebt = sheet.recapGoals.debt; 
    const actualSaved = sumIncome - actualSpent - actualDebt;
    
    const diffEarnt = sumIncome - sheet.recapGoals.earnt;
    const diffSpent = sheet.recapGoals.spent - actualSpent;
    const diffDebt = sheet.recapGoals.debt - actualDebt;
    const diffSaved = actualSaved - sheet.recapGoals.saved;

    const renderRows = (items: PlannerItem[]) => {
      return items.map((item) => `
        <tr>
          <td style="width: 20%; border: 1px solid black; padding: 6px; font-family: monospace; text-align: center; height: 24px;">${item.date || ''}</td>
          <td style="width: 60%; border: 1px solid black; padding: 6px; text-align: left; height: 24px;">${item.description || ''}</td>
          <td style="width: 20%; border: 1px solid black; padding: 6px; font-family: monospace; text-align: right; height: 24px;">${item.amount ? formatCurrency(item.amount, language) : ''}</td>
        </tr>
      `).join('');
    };

    printWindow.document.write(`
      <html>
        <head>
          <title>${category.toUpperCase()} - BUDGET PLANNER</title>
          <style>
            @media print {
              body { background-color: white !important; color: black !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
              .no-print { display: none !important; }
            }
            body {
              font-family: 'Georgia', serif;
              color: #111;
              background-color: #FAF8F5;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #ddd;
              box-shadow: 0 0 10px rgba(0,0,0,0.05);
            }
            h1 {
              font-size: 28px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 2px;
              text-align: center;
              margin-bottom: 20px;
              font-family: 'Times New Roman', Times, serif;
            }
            .grid-container {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-top: 20px;
            }
            .section-title {
              font-family: sans-serif;
              font-weight: bold;
              font-size: 14px;
              text-align: left;
              margin-bottom: 5px;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            th, td {
              border: 1px solid black;
              padding: 5px;
              font-size: 11px;
            }
            th {
              font-family: sans-serif;
              font-weight: bold;
              background-color: #f0f0f0;
              text-transform: uppercase;
              text-align: center;
            }
            .total-row td {
              font-weight: bold;
              font-family: sans-serif;
            }
            .header-inputs {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 20px;
            }
            .header-field {
              border-bottom: 1px solid black;
              padding-bottom: 5px;
              font-size: 12px;
              font-family: sans-serif;
              text-align: left;
            }
            .header-field-title {
              font-weight: bold;
            }
            .recap-table th {
              background-color: #e5e5e5;
            }
            .recap-table td {
              padding: 6px;
              height: 20px;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; text-align: center; color: #666; margin-bottom: 5px;">
            ${category}
          </div>
          <h1>Monthly Budget Planner</h1>
          
          <div class="header-inputs">
            <div class="header-field">
              <span class="header-field-title">Budget Goal:</span> ${sheet.budgetGoal || '&nbsp;'}
            </div>
            <div class="header-field">
              <span class="header-field-title">Month:</span> ${sheet.month || '&nbsp;'}
            </div>
          </div>
          
          <div class="grid-container">
            <div>
              <div class="section-title">Income</div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderRows(sheet.income)}
                  <tr class="total-row">
                    <td colspan="2">Total</td>
                    <td style="text-align: right; font-family: monospace;">${formatCurrency(sumIncome, language)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <div class="section-title">Fixed Expenses</div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderRows(sheet.fixedExpenses)}
                  <tr class="total-row">
                    <td colspan="2">Total</td>
                    <td style="text-align: right; font-family: monospace;">${formatCurrency(sumFixed, language)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <div class="section-title">Other Expenses</div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderRows(sheet.otherExpenses)}
                  <tr class="total-row">
                    <td colspan="2">Total</td>
                    <td style="text-align: right; font-family: monospace;">${formatCurrency(sumOther, language)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <div class="section-title">Bills</div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderRows(sheet.bills)}
                  <tr class="total-row">
                    <td colspan="2">Total</td>
                    <td style="text-align: right; font-family: monospace;">${formatCurrency(sumBills, language)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div style="margin-top: 10px;">
            <div class="section-title">Recap</div>
            <table class="recap-table">
              <thead>
                <tr>
                  <th style="width: 25%;"></th>
                  <th style="width: 25%;">Goal</th>
                  <th style="width: 25%;">Actual</th>
                  <th style="width: 25%;">Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: bold; background-color: #f9f9f9; text-align: left;">Earnt</td>
                  <td style="text-align: right; font-family: monospace;">${formatCurrency(sheet.recapGoals.earnt, language)}</td>
                  <td style="text-align: right; font-family: monospace;">${formatCurrency(sumIncome, language)}</td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold;">${formatCurrency(diffEarnt, language)}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; background-color: #f9f9f9; text-align: left;">Spent</td>
                  <td style="text-align: right; font-family: monospace;">${formatCurrency(sheet.recapGoals.spent, language)}</td>
                  <td style="text-align: right; font-family: monospace;">${formatCurrency(actualSpent, language)}</td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold;">${formatCurrency(diffSpent, language)}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; background-color: #f9f9f9; text-align: left;">Debt</td>
                  <td style="text-align: right; font-family: monospace;">${formatCurrency(sheet.recapGoals.debt, language)}</td>
                  <td style="text-align: right; font-family: monospace;">${formatCurrency(actualDebt, language)}</td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold;">${formatCurrency(diffDebt, language)}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; background-color: #f9f9f9; text-align: left;">Saved</td>
                  <td style="text-align: right; font-family: monospace;">${formatCurrency(sheet.recapGoals.saved, language)}</td>
                  <td style="text-align: right; font-family: monospace;">${formatCurrency(actualSaved, language)}</td>
                  <td style="text-align: right; font-family: monospace; font-weight: bold;">${formatCurrency(diffSaved, language)}</td>
                </tr>
              </tbody>
            </table>
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

  // Excel Sheet budget state
  const [excelRows, setExcelRows] = useState<ExcelRow[]>(() => {
    const saved = localStorage.getItem('omnisaas_excel_budget');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: '1', description: 'Monitor ultra-wide escritório', category: 'Produtividade', planned: 2500, actual: 2399, status: 'Concluído', notes: 'Melhorou a performance do time.' },
      { id: '2', description: 'Cadeira ergonômica', category: 'Saúde', planned: 1200, actual: 1250, status: 'Concluído', notes: 'Prevenção de dores lombares.' },
      { id: '3', description: 'Assinatura anual OpenAI API', category: 'Dinheiro', planned: 600, actual: 0, status: 'Pendente', notes: 'Lançar após receber fatura.' },
      { id: '4', description: 'Curso Avançado de LLMs', category: 'Estudos', planned: 800, actual: 800, status: 'Concluído', notes: 'Especialização da equipe.' },
      { id: '5', description: 'Enxoval do Theo bebê', category: 'Família', planned: 3000, actual: 2850, status: 'Concluído', notes: 'Maternidade comprada.' },
      { id: '6', description: 'Ar condicionado silencioso', category: 'Sono', planned: 1800, actual: 0, status: 'Pendente', notes: 'Melhora do bem-estar diário.' },
      { id: '7', description: 'Campanha de tráfego Meta Ads', category: 'Trabalho', planned: 4000, actual: 4100, status: 'Concluído', notes: 'Captação de leads CRM.' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('omnisaas_excel_budget', JSON.stringify(excelRows));
  }, [excelRows]);

  // Universal Planner states
  const [selectedPlannerCategory, setSelectedPlannerCategory] = useState<string>('Monthly Budget');
  const [plannerSheets, setPlannerSheets] = useState<{ [category: string]: PlannerSheet }>(() => {
    const saved = localStorage.getItem('omnisaas_planner_sheets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        PLANNER_CATEGORIES.forEach(cat => {
          if (!parsed[cat]) {
            parsed[cat] = DEFAULT_PLANNER_SHEET();
            parsed[cat].month = 'Julho / 2026';
          } else {
            // Ensure lists have 8 items
            const keys: ('income' | 'fixedExpenses' | 'otherExpenses' | 'bills')[] = ['income', 'fixedExpenses', 'otherExpenses', 'bills'];
            keys.forEach(listKey => {
              const list = parsed[cat][listKey] || [];
              if (list.length < 8) {
                parsed[cat][listKey] = [...list, ...Array.from({ length: 8 - list.length }, () => ({ date: '', description: '', amount: 0 }))];
              }
            });
          }
        });
        return parsed;
      } catch (e) {}
    }

    const initial: { [category: string]: PlannerSheet } = {};
    PLANNER_CATEGORIES.forEach(cat => {
      initial[cat] = DEFAULT_PLANNER_SHEET();
      initial[cat].month = 'Julho / 2026';
    });
    
    // Pre-populate 'Monthly Budget' category
    initial['Monthly Budget'].budgetGoal = 'Poupe 20% do salário';
    initial['Monthly Budget'].month = 'Julho / 2026';
    initial['Monthly Budget'].income[0] = { date: '05/07', description: 'Salário Base', amount: 4500 };
    initial['Monthly Budget'].income[1] = { date: '10/07', description: 'Consultoria Freelance', amount: 800 };
    initial['Monthly Budget'].fixedExpenses[0] = { date: '01/07', description: 'Aluguel Escritório', amount: 1200 };
    initial['Monthly Budget'].fixedExpenses[1] = { date: '05/07', description: 'Condomínio', amount: 350 };
    initial['Monthly Budget'].otherExpenses[0] = { date: '08/07', description: 'Almoço de Negócios', amount: 180 };
    initial['Monthly Budget'].bills[0] = { date: '10/07', description: 'Internet Fibra', amount: 120 };
    initial['Monthly Budget'].bills[1] = { date: '15/07', description: 'AWS Hosting', amount: 250 };
    initial['Monthly Budget'].recapGoals = {
      earnt: 5500,
      spent: 2200,
      debt: 200,
      saved: 3100
    };

    // Pre-populate 'Expense Tracker'
    initial['Expense Tracker'].budgetGoal = 'Controlar gastos extras';
    initial['Expense Tracker'].month = 'Julho / 2026';
    initial['Expense Tracker'].fixedExpenses[0] = { date: '02/07', description: 'Seguro Saúde', amount: 400 };
    initial['Expense Tracker'].otherExpenses[0] = { date: '05/07', description: 'Lazer e Cinema', amount: 90 };
    initial['Expense Tracker'].recapGoals = {
      earnt: 5300,
      spent: 2500,
      debt: 0,
      saved: 2800
    };

    return initial;
  });

  useEffect(() => {
    localStorage.setItem('omnisaas_planner_sheets', JSON.stringify(plannerSheets));
  }, [plannerSheets]);

  // Transaction form states & validation
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Vendas SaaS');
  const [txDate, setTxDate] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txError, setTxError] = useState('');

  // Budget form states & validation
  const [bgCategory, setBgCategory] = useState('Infraestrutura');
  const [bgLimit, setBgLimit] = useState('');
  const [bgPeriod, setBgPeriod] = useState('2026-07');
  const [bgError, setBgError] = useState('');

  // Selected category dashboard states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBudgetLimit, setSelectedBudgetLimit] = useState<number>(0);

  // Categories list
  const incomeCategories = ['Vendas SaaS', 'Consultorias', 'Aportes', 'Outros'];
  const expenseCategories = ['Infraestrutura', 'Ferramentas IA', 'Marketing', 'Alimentação', 'Folha de Pagamento', 'Escritório', 'Impostos', 'Outros'];

  useEffect(() => {
    setTransactions(LocalDatabase.getTransactions());
    setBudgets(LocalDatabase.getBudgets());
  }, []);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setTxError('Por favor, informe um valor monetário positivo maior que zero.');
      return;
    }
    if (!txDate) {
      setTxError('Por favor, insira uma data válida para o lançamento.');
      return;
    }
    setTxError('');

    const newTx = LocalDatabase.addTransaction({
      type: txType,
      amount: amountNum,
      category: txCategory,
      date: txDate,
      description: txDesc.trim() || `Lançamento de ${txCategory}`
    });

    // Refresh state
    setTransactions(LocalDatabase.getTransactions());
    setBudgets(LocalDatabase.getBudgets());
    
    // Reset inputs
    setTxAmount('');
    setTxDesc('');
    
    onShowNotification(
      'Lançamento Efetuado', 
      `${txType === 'income' ? 'Crédito' : 'Débito'} de ${formatCurrency(amountNum, language)} registrado em "${txCategory}".`, 
      'success'
    );
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(bgLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      setBgError('Por favor, insira um limite orçamentário positivo.');
      return;
    }
    if (!bgPeriod.trim()) {
      setBgError('Especifique a competência periódica (Ex: 2026-07).');
      return;
    }
    setBgError('');

    LocalDatabase.addBudget({
      category: bgCategory,
      limit_amount: limitNum,
      period: bgPeriod
    });

    setBudgets(LocalDatabase.getBudgets());
    setBgLimit('');
    onShowNotification('Teto Orçamentário Salvo', `Orçamento para "${bgCategory}" definido em ${formatCurrency(limitNum, language)}.`, 'success');
  };

  const handleDeleteTransaction = (id: string, amount: number) => {
    const updated = LocalDatabase.deleteTransaction(id);
    setTransactions(updated);
    setBudgets(LocalDatabase.getBudgets());
    onShowNotification('Transação Cancelada', `Lançamento de ${formatCurrency(amount, language)} apagado permanentemente.`, 'info');
  };

  const handleDeleteBudget = (id: string, category: string) => {
    const updated = LocalDatabase.deleteBudget(id);
    setBudgets(updated);
    onShowNotification('Orçamento Excluído', `Teto limite para "${category}" removido do controle corporativo.`, 'info');
  };

  const handleCategoryAddTransaction = (tx: Omit<Transaction, 'id' | 'user_id'>) => {
    LocalDatabase.addTransaction(tx);
    setTransactions(LocalDatabase.getTransactions());
    setBudgets(LocalDatabase.getBudgets());
    onShowNotification(
      'Lançamento Registrado', 
      `${tx.type === 'income' ? 'Receita' : 'Despesa'} de ${formatCurrency(tx.amount, language)} adicionada a ${tx.category}.`, 
      'success'
    );
  };

  const handleCategoryDeleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    const amount = tx ? tx.amount : 0;
    const updated = LocalDatabase.deleteTransaction(id);
    setTransactions(updated);
    setBudgets(LocalDatabase.getBudgets());
    onShowNotification('Lançamento Removido', `O registro de ${formatCurrency(amount, language)} foi removido com sucesso.`, 'info');
  };

  // Summaries calculation
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6" id="finance-view-root">
      
      {/* Top Ledger Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="finance-ledger-cards">
        {/* Receitas */}
        <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider block">Receita Bruta Acumulada</span>
            <span className="text-emerald-400 font-black text-xl">{formatCurrency(totalIncome, language)}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/10">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider block">Despesas Operacionais</span>
            <span className="text-rose-400 font-black text-xl">{formatCurrency(totalExpense, language)}</span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/10">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-slate-900/30 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider block">Fluxo de Caixa Líquido</span>
            <span className={`font-black text-xl ${balance >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              {formatCurrency(balance, language)}
            </span>
          </div>
          <div className={`p-3 rounded-xl border ${balance >= 0 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10' : 'bg-rose-500/10 text-rose-400 border-rose-500/10'}`}>
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-850 gap-1" id="finance-sub-tabs">
        <button 
          onClick={() => setActiveTab('cards')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'cards' 
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
          id="tab-btn-cards"
        >
          <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
          <span>Cartões & Faturas (Visa / Master)</span>
        </button>

        <button 
          onClick={() => setActiveTab('transactions')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'transactions' 
              ? 'border-indigo-500 text-indigo-450 bg-indigo-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
          id="tab-btn-transactions"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t('transactionsStatement', 'Extrato de Transações')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('budgets')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'budgets' 
              ? 'border-indigo-500 text-indigo-450 bg-indigo-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
          id="tab-btn-budgets"
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>{t('categoryBudgets', 'Orçamentos de Categoria')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('excel-budget')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'excel-budget' 
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
          id="tab-btn-excel-budget"
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('excelBudget', 'Planilha Orçamentária Excel (I Love Mi)')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('planner-universal')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'planner-universal' 
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
          id="tab-btn-planner-universal"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t('plannerUniversal', 'Planner Universal')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('paycheck-planner')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'paycheck-planner' 
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
          id="tab-btn-paycheck-planner"
        >
          <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('paycheckPlanner', 'Paycheck Planner (IA)')}</span>
        </button>
      </div>

      {/* VIEW 0: CARDS & CREDIT */}
      {activeTab === 'cards' && (
        <CardManagementView onShowNotification={onShowNotification} />
      )}

      {/* VIEW 1: TRANSACT FLOW */}
      {activeTab === 'transactions' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="panel-transactions">
          
          {/* Adicionar Transação Form */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 h-fit" id="transaction-form-panel">
            <h3 className="text-sm font-bold text-white tracking-tight mb-4 flex items-center">
              <PlusCircle className="w-4 h-4 mr-1.5 text-indigo-400" />
              {t('addTransaction', 'Lançar Movimentação Financeira')}
            </h3>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                <button 
                  type="button"
                  onClick={() => {
                    setTxType('income');
                    setTxCategory('Vendas SaaS');
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                    txType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Crédito (Entrada)</span>
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setTxType('expense');
                    setTxCategory('Infraestrutura');
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                    txType === 'expense' ? 'bg-rose-650 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Débito (Saída)</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Valor Monetário ({currencySymbol})</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-slate-500 font-bold text-xs">{currencySymbol}</span>
                  <input 
                    type="number" step="0.01" placeholder="450.00"
                    value={txAmount} onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 font-mono"
                    id="input-tx-amount"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Categoria</label>
                  <select 
                    value={txCategory} onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {txType === 'income' 
                      ? incomeCategories.map(c => <option key={c} value={c}>{c}</option>)
                      : expenseCategories.map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Data Competência</label>
                  <input 
                    type="date"
                    value={txDate} onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Descrição / Notas do Lançamento</label>
                <input 
                  type="text" placeholder="Ex: Assinatura AWS Cloud mensal"
                  value={txDesc} onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 rounded-xl transition"
                id="submit-tx-btn"
              >
                Salvar Lançamento
              </button>

              {txError && (
                <p className="text-rose-400 text-xs flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  {txError}
                </p>
              )}
            </form>
          </div>

          {/* Listagem Extrato */}
          <div className="xl:col-span-2 bg-slate-900/30 border border-slate-800 rounded-2xl p-6" id="transactions-ledger-panel">
            <h2 className="text-sm font-bold text-white tracking-tight mb-4 flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-indigo-400" />
              Histórico do Livro-Razão (Ledger)
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {transactions.map((t) => (
                <div key={t.id} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between hover:border-slate-800 transition">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2 rounded-lg border ${
                      t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : 'bg-rose-500/10 text-rose-400 border-rose-500/10'
                    }`}>
                      {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div className="truncate pr-4">
                      <p className="text-sm font-bold text-slate-200 truncate" title={t.description}>{t.description}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1">
                        <span className="font-semibold uppercase tracking-wider">{t.category}</span>
                        <span>•</span>
                        <span>{t.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`font-mono font-black text-sm ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount, language)}
                    </span>
                    <button 
                      onClick={() => handleDeleteTransaction(t.id, t.amount)}
                      className="text-slate-650 hover:text-rose-400 p-1.5 hover:bg-slate-900 rounded-lg transition"
                      title="Excluir lançamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-12">Nenhum lançamento financeiro catalogado.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: BUDGETS */}
      {activeTab === 'budgets' && (
        selectedCategory ? (
          <CategoryDashboard
            category={selectedCategory}
            budgetLimit={selectedBudgetLimit}
            transactions={transactions}
            onBack={() => setSelectedCategory(null)}
            onAddTransaction={handleCategoryAddTransaction}
            onDeleteTransaction={handleCategoryDeleteTransaction}
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="panel-budgets">
            
            {/* Adicionar Orçamento Form */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 h-fit" id="budget-form-panel">
              <h3 className="text-sm font-bold text-white tracking-tight mb-4 flex items-center">
                <PiggyBank className="w-4 h-4 mr-1.5 text-indigo-400" />
                Estipular Limite por Categoria
              </h3>

              <form onSubmit={handleAddBudget} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Categoria de Custo</label>
                  <select 
                    value={bgCategory} onChange={(e) => setBgCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Teto Máximo de Gastos ({currencySymbol})</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2 text-slate-500 font-bold text-xs">{currencySymbol}</span>
                    <input 
                      type="number" placeholder="2500"
                      value={bgLimit} onChange={(e) => setBgLimit(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Período / Competência</label>
                  <input 
                    type="text" placeholder="2026-07"
                    value={bgPeriod} onChange={(e) => setBgPeriod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-650 focus:outline-none font-mono"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 rounded-xl transition"
                  id="submit-budget-btn"
                >
                  Definir Teto Orçamentário
                </button>

                {bgError && (
                  <p className="text-rose-400 text-xs flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    {bgError}
                  </p>
                )}
              </form>
            </div>

            {/* Listagem de Orçamentos com Progress bar */}
            <div className="xl:col-span-2 bg-slate-900/30 border border-slate-800 rounded-2xl p-6" id="budgets-ledger-panel">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-white tracking-tight">Saúde dos Orçamentos Planejados</h2>
                <span className="text-[10px] text-[#1E73BE] font-bold uppercase tracking-wider font-mono animate-pulse">Clique no cartão para o Dashboard</span>
              </div>
              <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1">
                {budgets.map((b) => {
                  const percent = Math.min(100, (b.spent_amount / b.limit_amount) * 100);
                  const isOverBudget = b.spent_amount > b.limit_amount;
                  return (
                    <div 
                      key={b.id} 
                      onClick={() => {
                        setSelectedCategory(b.category);
                        setSelectedBudgetLimit(b.limit_amount);
                      }}
                      className="bg-slate-950/40 border border-slate-850 p-5 rounded-xl space-y-3 relative cursor-pointer hover:bg-slate-900/60 hover:border-slate-700 transition-all duration-300 group"
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBudget(b.id, b.category);
                        }}
                        className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-1 z-20"
                        title="Excluir orçamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition">{b.category}</h4>
                          <span className="text-[10px] bg-slate-900 text-slate-500 border border-slate-800/80 px-2 py-0.5 rounded-full mt-1.5 inline-block font-mono">Período: {b.period}</span>
                        </div>
                        <div className="text-right pr-6">
                          <span className="text-[10px] text-slate-500 block">Consumido</span>
                          <span className={`font-bold text-sm ${isOverBudget ? 'text-rose-400 font-extrabold' : 'text-slate-300'}`}>
                            {formatCurrency(b.spent_amount, language)} / {formatCurrency(b.limit_amount, language)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500' : percent >= 85 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">Utilização: {percent.toFixed(1)}%</span>
                          {isOverBudget ? (
                            <span className="text-rose-400 flex items-center font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 mr-0.5" />
                              Teto Estourado!
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center">
                              <CheckCircle className="w-3.5 h-3.5 mr-0.5" />
                              Dentro do limite
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] text-[#1E73BE] opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-right font-bold font-mono">
                        Visualizar Dashboard de Categoria →
                      </div>
                    </div>
                  );
                })}

                {budgets.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-12">Nenhum orçamento mensal planejado.</p>
                )}
              </div>
            </div>

          </div>
        )
      )}

      {/* VIEW 3: EXCEL BUDGET PLANNER */}
      {activeTab === 'excel-budget' && (
        <div className="space-y-6" id="panel-excel-budget">
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6" id="excel-instructions-card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  {t('excelBudgetTitle', 'Planilha de Planejamento Orçamentário (I Love Mi)')}
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-3">
                  {t('excelBudgetDesc', 'Uma planilha estilo Excel integrada para organizar e auditar suas metas de despesas nas sete principais áreas da sua vida. Toque em qualquer célula para editar diretamente.')}
                </p>
                
                {/* Export Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-850">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold self-center mr-1">Exportar:</span>
                  <button
                    onClick={() => handleExport('excel')}
                    className="bg-slate-900 hover:bg-slate-850 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                    title="Exportar para formato Excel (.xls/.csv)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>EXCEL</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="bg-slate-900 hover:bg-slate-850 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                    title="Salvar como PDF"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport('docs')}
                    className="bg-slate-900 hover:bg-slate-850 border border-blue-500/30 hover:border-blue-500/60 text-blue-400 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                    title="Exportar Relatório Word"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>DOCS</span>
                  </button>
                  <button
                    onClick={() => handleExport('print')}
                    className="bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-slate-500 text-slate-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                    title="Imprimir Planilha"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const newRow: ExcelRow = {
                      id: Math.random().toString(),
                      description: 'Novo Item de Planejamento',
                      category: 'Produtividade',
                      planned: 0,
                      actual: 0,
                      status: 'Pendente',
                      notes: ''
                    };
                    setExcelRows([...excelRows, newRow]);
                    onShowNotification('Sucesso', 'Nova linha adicionada à planilha', 'success');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                  id="excel-add-row"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Linha</span>
                </button>
                <button
                  onClick={() => {
                    if(confirm('Tem certeza de que deseja redefinir os dados da planilha para o padrão?')) {
                      localStorage.removeItem('omnisaas_excel_budget');
                      setExcelRows([
                        { id: '1', description: 'Monitor ultra-wide escritório', category: 'Produtividade', planned: 2500, actual: 2399, status: 'Concluído', notes: 'Melhorou a performance do time.' },
                        { id: '2', description: 'Cadeira ergonômica', category: 'Saúde', planned: 1200, actual: 1250, status: 'Concluído', notes: 'Prevenção de dores lombares.' },
                        { id: '3', description: 'Assinatura anual OpenAI API', category: 'Dinheiro', planned: 600, actual: 0, status: 'Pendente', notes: 'Lançar após receber fatura.' },
                        { id: '4', description: 'Curso Avançado de LLMs', category: 'Estudos', planned: 800, actual: 800, status: 'Concluído', notes: 'Especialização da equipe.' },
                        { id: '5', description: 'Enxoval do Theo bebê', category: 'Família', planned: 3000, actual: 2850, status: 'Concluído', notes: 'Maternidade comprada.' },
                        { id: '6', description: 'Ar condicionado silencioso', category: 'Sono', planned: 1800, actual: 0, status: 'Pendente', notes: 'Melhora do bem-estar diário.' },
                        { id: '7', description: 'Campanha de tráfego Meta Ads', category: 'Trabalho', planned: 4000, actual: 4100, status: 'Concluído', notes: 'Captação de leads CRM.' },
                      ]);
                      onShowNotification('Sucesso', 'Planilha redefinida com valores padrão', 'success');
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  id="excel-reset"
                >
                  Redefinir
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Spreadsheet */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden" id="excel-grid-container">
            <div className="overflow-x-auto text-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4 w-12 text-center">Ref</th>
                    <th className="py-3 px-4 min-w-[220px]">Item / Descrição</th>
                    <th className="py-3 px-4 min-w-[150px]">Categoria de Vida</th>
                    <th className="py-3 px-4 text-right w-36">Valor Planejado ({currencySymbol})</th>
                    <th className="py-3 px-4 text-right w-36">Valor Real ({currencySymbol})</th>
                    <th className="py-3 px-4 text-right w-36">Diferença ({currencySymbol})</th>
                    <th className="py-3 px-4 text-center w-32">Status</th>
                    <th className="py-3 px-4 min-w-[200px]">Notas / Observações</th>
                    <th className="py-3 px-4 text-center w-12">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs font-mono">
                  {excelRows.map((row, index) => {
                    const diff = row.planned - row.actual;
                    const diffColor = diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400 font-bold' : 'text-slate-550';

                    const updateField = (field: keyof ExcelRow, value: any) => {
                      const updated = excelRows.map(r => r.id === row.id ? { ...r, [field]: value } : r);
                      setExcelRows(updated);
                    };

                    return (
                      <tr key={row.id} className="hover:bg-slate-900/30 transition-all">
                        <td className="py-2.5 px-4 text-center text-slate-600 bg-slate-900/10 border-r border-slate-850">
                          {String.fromCharCode(65 + (index % 26))}{index + 1}
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={row.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            className="w-full bg-transparent text-slate-100 px-3 py-1.5 focus:outline-none focus:bg-slate-850 focus:ring-1 focus:ring-emerald-500 rounded font-sans"
                          />
                        </td>
                        <td className="p-1">
                          <select
                            value={row.category}
                            onChange={(e) => updateField('category', e.target.value)}
                            className="w-full bg-slate-900/60 border-0 text-slate-300 px-2.5 py-1.5 rounded focus:outline-none focus:bg-slate-850 font-sans cursor-pointer"
                          >
                            <option value="Sono">😴 Sono</option>
                            <option value="Saúde">🏥 Saúde</option>
                            <option value="Dinheiro">💰 Dinheiro</option>
                            <option value="Produtividade">⚡ Produtividade</option>
                            <option value="Estudos">📚 Estudos</option>
                            <option value="Família">👪 Família</option>
                            <option value="Trabalho">💼 Trabalho</option>
                          </select>
                        </td>
                        <td className="p-1 text-right">
                          <input
                            type="number"
                            value={row.planned || ''}
                            onChange={(e) => updateField('planned', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent text-right text-indigo-400 px-3 py-1.5 focus:outline-none focus:bg-slate-850 focus:ring-1 focus:ring-emerald-500 rounded"
                          />
                        </td>
                        <td className="p-1 text-right">
                          <input
                            type="number"
                            value={row.actual || ''}
                            onChange={(e) => updateField('actual', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent text-right text-rose-400 px-3 py-1.5 focus:outline-none focus:bg-slate-850 focus:ring-1 focus:ring-emerald-500 rounded"
                          />
                        </td>
                        <td className={`py-2 px-4 text-right font-bold ${diffColor}`}>
                          {diff >= 0 ? `+ ${formatCurrency(diff, language)}` : `- ${formatCurrency(Math.abs(diff), language)}`}
                        </td>
                        <td className="p-1 text-center">
                          <button
                            onClick={() => updateField('status', row.status === 'Concluído' ? 'Pendente' : 'Concluído')}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase inline-block border cursor-pointer ${
                              row.status === 'Concluído'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}
                          >
                            {row.status}
                          </button>
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            value={row.notes}
                            onChange={(e) => updateField('notes', e.target.value)}
                            className="w-full bg-transparent text-slate-350 px-3 py-1.5 focus:outline-none focus:bg-slate-850 focus:ring-1 focus:ring-emerald-500 rounded font-sans"
                            placeholder="Adicionar notas..."
                          />
                        </td>
                        <td className="py-2 px-4 text-center">
                          <button
                            onClick={() => {
                              const filtered = excelRows.filter(r => r.id !== row.id);
                              setExcelRows(filtered);
                              onShowNotification('Sucesso', 'Item removido da planilha', 'info');
                            }}
                            className="text-slate-600 hover:text-rose-400 p-1 cursor-pointer"
                            title="Remover linha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900/40 text-xs font-bold border-t border-slate-800">
                    <td colSpan={3} className="py-3 px-4 text-slate-400 uppercase text-[10px]">{t('totalConsolidated', 'Totais Consolidados')}</td>
                    <td className="py-3 px-4 text-right text-indigo-400 font-bold">
                      {formatCurrency(excelRows.reduce((sum, r) => sum + r.planned, 0), language)}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-400 font-bold">
                      {formatCurrency(excelRows.reduce((sum, r) => sum + r.actual, 0), language)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-200 font-bold">
                      {formatCurrency(excelRows.reduce((sum, r) => sum + (r.planned - r.actual), 0), language)}
                    </td>
                    <td colSpan={3} className="py-3 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: PLANNER UNIVERSAL */}
      {activeTab === 'planner-universal' && (() => {
        const sheet = plannerSheets[selectedPlannerCategory] || DEFAULT_PLANNER_SHEET();
        
        const sumIncome = sheet.income.reduce((sum, item) => sum + (item.amount || 0), 0);
        const sumFixed = sheet.fixedExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
        const sumOther = sheet.otherExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
        const sumBills = sheet.bills.reduce((sum, item) => sum + (item.amount || 0), 0);
        
        const actualSpent = sumFixed + sumOther + sumBills;
        const actualDebt = sheet.recapGoals.debt; 
        const actualSaved = sumIncome - actualSpent - actualDebt;
        
        const diffEarnt = sumIncome - sheet.recapGoals.earnt;
        const diffSpent = sheet.recapGoals.spent - actualSpent;
        const diffDebt = sheet.recapGoals.debt - actualDebt;
        const diffSaved = actualSaved - sheet.recapGoals.saved;

        const updateField = (listKey: 'income' | 'fixedExpenses' | 'otherExpenses' | 'bills', index: number, field: 'date' | 'description' | 'amount', value: any) => {
          setPlannerSheets(prev => {
            const currentCat = prev[selectedPlannerCategory] || DEFAULT_PLANNER_SHEET();
            const updatedList = [...currentCat[listKey]];
            updatedList[index] = { ...updatedList[index], [field]: value };
            return {
              ...prev,
              [selectedPlannerCategory]: {
                ...currentCat,
                [listKey]: updatedList
              }
            };
          });
        };

        const renderTable = (title: string, listKey: 'income' | 'fixedExpenses' | 'otherExpenses' | 'bills', items: PlannerItem[], totalVal: number) => {
          return (
            <div className="bg-transparent border border-black rounded-sm overflow-hidden flex flex-col">
              <div className="bg-slate-200/50 border-b border-black text-[12px] font-sans font-bold text-slate-900 py-1 px-2 text-left uppercase tracking-wider">
                {title}
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/30 text-[10px] font-bold text-slate-850 uppercase border-b border-black">
                    <th className="py-1 px-1.5 border-r border-black w-[20%] text-center">Date</th>
                    <th className="py-1 px-1.5 border-r border-black w-[55%]">Description</th>
                    <th className="py-1 px-1.5 text-right w-[25%]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/40">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-black/5">
                      <td className="p-0 border-r border-black">
                        <input 
                          type="text" 
                          value={item.date} 
                          onChange={(e) => updateField(listKey, idx, 'date', e.target.value)}
                          className="w-full bg-transparent text-slate-900 font-mono text-center text-xs py-0.5 px-1 focus:outline-none focus:bg-white"
                          placeholder="Ex: 05/07"
                        />
                      </td>
                      <td className="p-0 border-r border-black">
                        <input 
                          type="text" 
                          value={item.description} 
                          onChange={(e) => updateField(listKey, idx, 'description', e.target.value)}
                          className="w-full bg-transparent text-slate-900 font-sans text-xs py-0.5 px-1.5 focus:outline-none focus:bg-white"
                          placeholder="Descrição..."
                        />
                      </td>
                      <td className="p-0">
                        <input 
                          type="number" 
                          value={item.amount || ''} 
                          onChange={(e) => updateField(listKey, idx, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent text-slate-900 font-mono text-right text-xs py-0.5 px-1.5 focus:outline-none focus:bg-white"
                          placeholder="0.00"
                        />
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-slate-100/30 border-t border-black font-bold">
                    <td colSpan={2} className="py-1 px-2 border-r border-black text-xs uppercase text-slate-800">
                      Total
                    </td>
                    <td className="py-1 px-1.5 text-right font-mono text-xs text-slate-900 bg-slate-100/30">
                      {formatCurrency(totalVal, language)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        };

        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6" id="planner-universal-root">
            {/* Left Category Selector Sidebar */}
            <div className="xl:col-span-1 bg-slate-900/30 border border-slate-800 rounded-2xl p-4 h-fit">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Planner Universal</h3>
              <div className="space-y-1">
                {PLANNER_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedPlannerCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                      selectedPlannerCategory === cat
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedPlannerCategory === cat ? 'bg-white' : 'bg-slate-650'}`}></span>
                  </button>
                ))}
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
                <button
                  onClick={() => handlePrintPlanner(selectedPlannerCategory, sheet)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Imprimir Planner / PDF</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Tem certeza de que deseja limpar os dados de "${selectedPlannerCategory}"?`)) {
                      setPlannerSheets(prev => ({
                        ...prev,
                        [selectedPlannerCategory]: DEFAULT_PLANNER_SHEET()
                      }));
                      onShowNotification('Sucesso', `Dados de "${selectedPlannerCategory}" limpos com sucesso!`, 'info');
                    }
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-rose-400 border border-rose-500/10 hover:border-rose-500/20 text-xs font-medium py-2 px-3 rounded-xl transition"
                >
                  Limpar Planilha
                </button>
              </div>
            </div>

            {/* Right Printable Sheet */}
            <div className="xl:col-span-3">
              <div className="bg-[#FAF8F5] border border-slate-300 p-6 md:p-8 rounded-xl shadow-xl text-slate-900 max-w-4xl mx-auto font-serif min-h-[900px] flex flex-col justify-between">
                <div>
                  <div className="text-center pb-2 border-b border-black">
                    <p className="text-[10px] font-sans font-bold tracking-widest text-slate-500 uppercase">{selectedPlannerCategory}</p>
                    <h2 className="text-3xl font-black tracking-widest text-black uppercase mt-1" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                      Monthly Budget Planner
                    </h2>
                  </div>

                  {/* Goal and Month Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6 px-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-sans font-bold text-black text-xs uppercase tracking-wider">Budget Goal:</span>
                      <input 
                        type="text" 
                        value={sheet.budgetGoal}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlannerSheets(prev => ({
                            ...prev,
                            [selectedPlannerCategory]: { ...prev[selectedPlannerCategory], budgetGoal: val }
                          }));
                        }}
                        className="flex-1 bg-transparent border-b border-black text-slate-900 font-sans text-sm focus:outline-none px-1 py-0.5"
                        placeholder="Escreva a meta principal..."
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-sans font-bold text-black text-xs uppercase tracking-wider">Month:</span>
                      <input 
                        type="text" 
                        value={sheet.month}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlannerSheets(prev => ({
                            ...prev,
                            [selectedPlannerCategory]: { ...prev[selectedPlannerCategory], month: val }
                          }));
                        }}
                        className="flex-1 bg-transparent border-b border-black text-slate-900 font-sans text-sm focus:outline-none px-1 py-0.5"
                        placeholder="Ex: Julho / 2026"
                      />
                    </div>
                  </div>

                  {/* 2x2 Tables Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {renderTable('Income', 'income', sheet.income, sumIncome)}
                    {renderTable('Fixed Expenses', 'fixedExpenses', sheet.fixedExpenses, sumFixed)}
                    {renderTable('Other Expenses', 'otherExpenses', sheet.otherExpenses, sumOther)}
                    {renderTable('Bills', 'bills', sheet.bills, sumBills)}
                  </div>
                </div>

                {/* Recap Table Section */}
                <div className="mt-8 border-t border-black/30 pt-6">
                  <div className="bg-slate-200/50 border border-black text-[12px] font-sans font-bold text-slate-900 py-1.5 px-3 text-left uppercase tracking-wider">
                    Recap
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-black border-t-0 text-xs">
                      <thead>
                        <tr className="bg-slate-100/30 font-bold border-b border-black text-[11px] text-slate-800">
                          <th className="py-2 px-3 border-r border-black w-[25%]"></th>
                          <th className="py-2 px-3 border-r border-black w-[25%] text-right">Goal ({currencySymbol})</th>
                          <th className="py-2 px-3 border-r border-black w-[25%] text-right">Actual ({currencySymbol})</th>
                          <th className="py-2 px-3 w-[25%] text-right">Difference ({currencySymbol})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/60">
                        {/* Earnt */}
                        <tr className="hover:bg-black/5">
                          <td className="py-1.5 px-3 border-r border-black font-sans font-bold text-slate-900">Earnt</td>
                          <td className="p-0 border-r border-black">
                            <input 
                              type="number" 
                              value={sheet.recapGoals.earnt || ''}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setPlannerSheets(prev => {
                                  const c = prev[selectedPlannerCategory] || DEFAULT_PLANNER_SHEET();
                                  return { ...prev, [selectedPlannerCategory]: { ...c, recapGoals: { ...c.recapGoals, earnt: val } } };
                                });
                              }}
                              className="w-full bg-transparent text-right font-mono py-1 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="py-1.5 px-3 border-r border-black text-right font-mono text-slate-900 bg-slate-100/10">{sumIncome.toFixed(2)}</td>
                          <td className={`py-1.5 px-3 text-right font-mono font-bold ${diffEarnt >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {diffEarnt >= 0 ? '+' : ''}{diffEarnt.toFixed(2)}
                          </td>
                        </tr>

                        {/* Spent */}
                        <tr className="hover:bg-black/5">
                          <td className="py-1.5 px-3 border-r border-black font-sans font-bold text-slate-900">Spent</td>
                          <td className="p-0 border-r border-black">
                            <input 
                              type="number" 
                              value={sheet.recapGoals.spent || ''}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setPlannerSheets(prev => {
                                  const c = prev[selectedPlannerCategory] || DEFAULT_PLANNER_SHEET();
                                  return { ...prev, [selectedPlannerCategory]: { ...c, recapGoals: { ...c.recapGoals, spent: val } } };
                                });
                              }}
                              className="w-full bg-transparent text-right font-mono py-1 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="py-1.5 px-3 border-r border-black text-right font-mono text-slate-900 bg-slate-100/10">{actualSpent.toFixed(2)}</td>
                          <td className={`py-1.5 px-3 text-right font-mono font-bold ${diffSpent >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {diffSpent >= 0 ? 'Poupança +' : 'Diferença '}{diffSpent.toFixed(2)}
                          </td>
                        </tr>

                        {/* Debt */}
                        <tr className="hover:bg-black/5">
                          <td className="py-1.5 px-3 border-r border-black font-sans font-bold text-slate-900">Debt</td>
                          <td className="p-0 border-r border-black">
                            <input 
                              type="number" 
                              value={sheet.recapGoals.debt || ''}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setPlannerSheets(prev => {
                                  const c = prev[selectedPlannerCategory] || DEFAULT_PLANNER_SHEET();
                                  return { ...prev, [selectedPlannerCategory]: { ...c, recapGoals: { ...c.recapGoals, debt: val } } };
                                });
                              }}
                              className="w-full bg-transparent text-right font-mono py-1 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="py-1.5 px-3 border-r border-black text-right font-mono text-slate-900 bg-slate-100/10">{actualDebt.toFixed(2)}</td>
                          <td className={`py-1.5 px-3 text-right font-mono font-bold ${diffDebt >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {diffDebt >= 0 ? 'Menos -' : '+'}{diffDebt.toFixed(2)}
                          </td>
                        </tr>

                        {/* Saved */}
                        <tr className="bg-slate-100/10 hover:bg-black/5">
                          <td className="py-1.5 px-3 border-r border-black font-sans font-bold text-slate-900">Saved</td>
                          <td className="p-0 border-r border-black">
                            <input 
                              type="number" 
                              value={sheet.recapGoals.saved || ''}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setPlannerSheets(prev => {
                                  const c = prev[selectedPlannerCategory] || DEFAULT_PLANNER_SHEET();
                                  return { ...prev, [selectedPlannerCategory]: { ...c, recapGoals: { ...c.recapGoals, saved: val } } };
                                });
                              }}
                              className="w-full bg-transparent text-right font-mono py-1 px-3 focus:outline-none"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="py-1.5 px-3 border-r border-black text-right font-mono text-slate-900 font-bold bg-slate-200/20">{actualSaved.toFixed(2)}</td>
                          <td className={`py-1.5 px-3 text-right font-mono font-bold ${diffSaved >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {diffSaved >= 0 ? 'Poupou +' : ''}{diffSaved.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* VIEW 5: PAYCHECK PLANNER (IA) */}
      {activeTab === 'paycheck-planner' && (
        <PaycheckPlannerView />
      )}

    </div>
  );
}
