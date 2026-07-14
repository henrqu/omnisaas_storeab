/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Habit,
  Goal,
  HealthRecord,
  Meal,
  PregnancyRecord,
  FamilyMember,
  Transaction,
  Budget,
  Company,
  Employee,
  Payroll,
  Product,
  Inventory,
  Customer,
  Sale,
  Report,
  AiHistory,
  Notification,
  Subscription,
  Profile,
  EBook
} from '../types/schema';

// Helper to generate UUIDs
const uuid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Default Seed Data
const DEFAULT_PROFILE: Profile = {
  id: 'user-default-123',
  updated_at: new Date().toISOString(),
  username: 'lacasaking',
  full_name: 'Lucas King',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'owner',
};

const DEFAULT_SUBSCRIPTION: Subscription = {
  id: uuid(),
  user_id: 'user-default-123',
  status: 'active',
  price_id: 'price_stripe_pro_annual',
  cancel_at_period_end: false,
  current_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  current_period_end: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
  tier_name: 'Pro Plan',
};

const DEFAULT_HABITS: Habit[] = [
  { id: uuid(), user_id: 'user-default-123', name: 'Meditar 10 min', frequency: 'daily', streak: 12, last_completed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], created_at: new Date().toISOString() },
  { id: uuid(), user_id: 'user-default-123', name: 'Beber 3L de Água', frequency: 'daily', streak: 4, last_completed: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() },
  { id: uuid(), user_id: 'user-default-123', name: 'Atividade Física', frequency: 'daily', streak: 0, last_completed: null, created_at: new Date().toISOString() },
  { id: uuid(), user_id: 'user-default-123', name: 'Revisão Semanal ERP', frequency: 'weekly', streak: 3, last_completed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], created_at: new Date().toISOString() },
];

const DEFAULT_GOALS: Goal[] = [
  { id: uuid(), user_id: 'user-default-123', name: 'Atingir R$ 20k de MRR no SaaS', target_value: 20000, current_value: 12450, unit: 'R$', deadline: '2026-12-31', category: 'business', status: 'in_progress' },
  { id: uuid(), user_id: 'user-default-123', name: 'Reduzir percentual de gordura para 12%', target_value: 12, current_value: 14.5, unit: '%', deadline: '2026-09-30', category: 'fitness', status: 'in_progress' },
  { id: uuid(), user_id: 'user-default-123', name: 'Ler 12 Livros de Negócios', target_value: 12, current_value: 7, unit: 'livros', deadline: '2026-12-15', category: 'personal', status: 'in_progress' },
];

const DEFAULT_HEALTH: HealthRecord[] = [
  { id: uuid(), user_id: 'user-default-123', date: new Date().toISOString().split('T')[0], weight: 78.5, systolic: 120, diastolic: 80, sleep_hours: 7.5, symptoms: 'Nenhum', notes: 'Disposição excelente pela manhã.' },
  { id: uuid(), user_id: 'user-default-123', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 78.9, systolic: 118, diastolic: 78, sleep_hours: 6.8, symptoms: 'Leve dor de cabeça', notes: 'Dia estressante no trabalho.' },
];

const DEFAULT_PREGNANCY: PregnancyRecord[] = [
  { id: uuid(), user_id: 'user-default-123', date: new Date().toISOString().split('T')[0], week_number: 14, weight: 64.2, symptoms: 'Leves enjoos matinais, cansaço no fim do dia', baby_size_estimate: 'Tamanho de um limão (aprox. 8.5 cm)', doctor_notes: 'Exame morfológico agendado para a próxima semana. Tudo correndo muito bem.' },
];

const DEFAULT_MEALS: Meal[] = [
  { id: uuid(), user_id: 'user-default-123', date: new Date().toISOString().split('T')[0], meal_type: 'breakfast', food_name: 'Pão integral, ovos mexidos (3) e café sem açúcar', calories: 420, protein: 24, carbs: 32, fat: 16 },
  { id: uuid(), user_id: 'user-default-123', date: new Date().toISOString().split('T')[0], meal_type: 'lunch', food_name: 'Arroz integral, feijão, filé de frango (150g) e salada mista', calories: 580, protein: 42, carbs: 65, fat: 12 },
  { id: uuid(), user_id: 'user-default-123', date: new Date().toISOString().split('T')[0], meal_type: 'dinner', food_name: 'Salmão grelhado, brócolis e batata doce', calories: 510, protein: 38, carbs: 40, fat: 18 },
];

const DEFAULT_FAMILY: FamilyMember[] = [
  { id: uuid(), user_id: 'user-default-123', name: 'Ana Souza King', relationship: 'spouse', birth_date: '1995-04-18', notes: 'Gosta de alimentação saudável e pratica ioga.' },
  { id: uuid(), user_id: 'user-default-123', name: 'Theo Souza King', relationship: 'child', birth_date: '2024-02-12', notes: 'Alergia a proteína do leite de vaca (APLV).' },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: uuid(), user_id: 'user-default-123', type: 'income', amount: 15400.00, category: 'Vendas SaaS', date: new Date().toISOString().split('T')[0], description: 'Pagamento das assinaturas mensais recorrentes Stripe' },
  { id: uuid(), user_id: 'user-default-123', type: 'expense', amount: 1450.00, category: 'Infraestrutura', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'Fatura mensal AWS Cloud Hosting' },
  { id: uuid(), user_id: 'user-default-123', type: 'expense', amount: 350.00, category: 'Ferramentas IA', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'Faturamento de créditos de uso OpenAI API' },
  { id: uuid(), user_id: 'user-default-123', type: 'income', amount: 2300.00, category: 'Consultorias', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'Consultoria de automação de fluxo ERP' },
  { id: uuid(), user_id: 'user-default-123', type: 'expense', amount: 80.00, category: 'Alimentação', date: new Date().toISOString().split('T')[0], description: 'Supermercado semanal para dieta' },
];

const DEFAULT_BUDGETS: Budget[] = [
  { id: uuid(), user_id: 'user-default-123', category: 'Infraestrutura', limit_amount: 2000.00, spent_amount: 1450.00, period: '2026-07' },
  { id: uuid(), user_id: 'user-default-123', category: 'Ferramentas IA', limit_amount: 500.00, spent_amount: 350.00, period: '2026-07' },
  { id: uuid(), user_id: 'user-default-123', category: 'Alimentação', limit_amount: 1200.00, spent_amount: 80.00, period: '2026-07' },
  { id: uuid(), user_id: 'user-default-123', category: 'Marketing', limit_amount: 3000.00, spent_amount: 1500.00, period: '2026-07' },
];

const DEFAULT_COMPANIES: Company[] = [
  { id: 'comp-default-abc', owner_id: 'user-default-123', name: 'Vesta Software & IA Ltda', tax_id: '45.123.897/0001-22', address: 'Av. Paulista, 1000 - São Paulo, SP', website: 'https://vestasites.com' },
];

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'emp-1', company_id: 'comp-default-abc', first_name: 'Juliana', last_name: 'Mendes', email: 'juliana.mendes@vesta.com', role: 'Engenheira de IA Principal', hire_date: '2025-01-15', salary: 14500.00, status: 'active' },
  { id: 'emp-2', company_id: 'comp-default-abc', first_name: 'Bruno', last_name: 'Almeida', email: 'bruno.almeida@vesta.com', role: 'UI/UX Designer', hire_date: '2025-04-10', salary: 7800.00, status: 'active' },
  { id: 'emp-3', company_id: 'comp-default-abc', first_name: 'Carla', last_name: 'Silveira', email: 'carla.silveira@vesta.com', role: 'Gerente de Growth & Marketing', hire_date: '2025-11-01', salary: 9200.00, status: 'active' },
];

const DEFAULT_PAYROLL: Payroll[] = [
  { id: uuid(), employee_id: 'emp-1', pay_period: '2026-07', base_salary: 14500.00, bonuses: 1200.00, deductions: 2900.00, net_pay: 12800.00, status: 'processed', processed_at: new Date().toISOString() },
  { id: uuid(), employee_id: 'emp-2', pay_period: '2026-07', base_salary: 7800.00, bonuses: 300.00, deductions: 1250.00, net_pay: 6850.00, status: 'pending', processed_at: null },
  { id: uuid(), employee_id: 'emp-3', pay_period: '2026-07', base_salary: 9200.00, bonuses: 0, deductions: 1580.00, net_pay: 7620.00, status: 'paid', processed_at: new Date().toISOString() },
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'prod-1', company_id: 'comp-default-abc', name: 'Licença Mensal OmniSaaS Pro', sku: 'OS-PRO-M', price: 299.00, cost: 45.00, description: 'Acesso completo a todas as ferramentas corporativas, financeiras e pessoais com IA.' },
  { id: 'prod-2', company_id: 'comp-default-abc', name: 'Integração de APIs Customizadas', sku: 'OS-API-CUSTOM', price: 1899.00, cost: 200.00, description: 'Pacote de integração e setup assistido de APIs para ERP do cliente.' },
  { id: 'prod-3', company_id: 'comp-default-abc', name: 'Mentoria Executiva All-in-One', sku: 'OS-MENTOR-HQ', price: 3500.00, cost: 0, description: 'Seção de consultoria estratégica 1-on-1 com mentoria de arquitetura de software.' },
];

const DEFAULT_INVENTORY: Inventory[] = [
  { id: uuid(), product_id: 'prod-1', quantity: 9999, location: 'Nuvem AWS (Digital)', reorder_point: 50 },
  { id: uuid(), product_id: 'prod-2', quantity: 45, location: 'Fila de Serviços', reorder_point: 5 },
  { id: uuid(), product_id: 'prod-3', quantity: 8, location: 'Agenda Lucas King', reorder_point: 2 },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'cust-1', company_id: 'comp-default-abc', name: 'Rodrigo Fontes', email: 'rodrigo@fontescorp.com', phone: '(11) 98765-4321', tags: ['VIP', 'Ativo'] },
  { id: 'cust-2', company_id: 'comp-default-abc', name: 'Mariana Azevedo', email: 'mariana.az@gmail.com', phone: '(21) 97112-5500', tags: ['Novo'] },
  { id: 'cust-3', company_id: 'comp-default-abc', name: 'Carlos Santos da S.A.', email: 'financeiro@santosltda.org', phone: '(19) 3255-8899', tags: ['Ativo'] },
];

const DEFAULT_SALES: Sale[] = [
  { id: uuid(), company_id: 'comp-default-abc', customer_id: 'cust-1', product_id: 'prod-1', quantity: 1, total_amount: 299.00, date: new Date().toISOString(), status: 'completed' },
  { id: uuid(), company_id: 'comp-default-abc', customer_id: 'cust-2', product_id: 'prod-2', quantity: 1, total_amount: 1899.00, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
  { id: uuid(), company_id: 'comp-default-abc', customer_id: 'cust-3', product_id: 'prod-1', quantity: 5, total_amount: 1495.00, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
];

const DEFAULT_REPORTS: Report[] = [
  {
    id: uuid(),
    company_id: 'comp-default-abc',
    type: 'sales',
    name: 'Desempenho Comercial Trimestral',
    data: JSON.stringify({ totalSales: 17244.00, count: 18, conversionRate: 14.2, topProduct: 'OmniSaaS Pro' }),
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_AI_HISTORY: AiHistory[] = [
  { id: uuid(), user_id: 'user-default-123', prompt: 'Gere um resumo financeiro com base nos dados de receita de julho.', response: 'Com base no faturamento de R$ 17.700,00 e despesas totais de R$ 1.880,00, a margem de lucro operacional do seu negócio é de 89.37%. O maior gargalo de custo está no setor de Infraestrutura (AWS). Recomenda-se reservar 15% para provisionamento tributário trimestral.', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), tokens_used: 120 },
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: uuid(), user_id: 'user-default-123', title: 'Boas-vindas ao OmniSaaS!', message: 'O seu sistema está configurado com 21 tabelas relacionais PostgreSQL e pronto para operar.', read: false, type: 'success', created_at: new Date().toISOString() },
  { id: uuid(), user_id: 'user-default-123', title: 'Folha de Pagamento Aberta', message: 'A folha de pagamento de Bruno Almeida aguarda sua validação e processamento.', read: false, type: 'warning', created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
];


// Database Init & Storage Layer
export class LocalDatabase {
  private static get<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(`omnisaas_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static set<T>(key: string, value: T): void {
    localStorage.setItem(`omnisaas_${key}`, JSON.stringify(value));
  }

  // Initializer
  static init() {
    if (!localStorage.getItem('omnisaas_initialized')) {
      this.set('profile', DEFAULT_PROFILE);
      this.set('subscription', DEFAULT_SUBSCRIPTION);
      this.set('habits', DEFAULT_HABITS);
      this.set('goals', DEFAULT_GOALS);
      this.set('health_records', DEFAULT_HEALTH);
      this.set('pregnancy_records', DEFAULT_PREGNANCY);
      this.set('meals', DEFAULT_MEALS);
      this.set('family_members', DEFAULT_FAMILY);
      this.set('transactions', DEFAULT_TRANSACTIONS);
      this.set('budgets', DEFAULT_BUDGETS);
      this.set('companies', DEFAULT_COMPANIES);
      this.set('employees', DEFAULT_EMPLOYEES);
      this.set('payroll', DEFAULT_PAYROLL);
      this.set('products', DEFAULT_PRODUCTS);
      this.set('inventory', DEFAULT_INVENTORY);
      this.set('customers', DEFAULT_CUSTOMERS);
      this.set('sales', DEFAULT_SALES);
      this.set('reports', DEFAULT_REPORTS);
      this.set('ai_history', DEFAULT_AI_HISTORY);
      this.set('notifications', DEFAULT_NOTIFICATIONS);
      localStorage.setItem('omnisaas_initialized', 'true');
    }
  }

  // --- Profiles & Users ---
  static getProfile(): Profile {
    return this.get<Profile>('profile', DEFAULT_PROFILE);
  }

  static updateProfile(profile: Partial<Profile>): Profile {
    const current = this.getProfile();
    const updated = { ...current, ...profile, updated_at: new Date().toISOString() };
    this.set('profile', updated);
    return updated;
  }

  // --- Subscriptions ---
  static getSubscription(): Subscription {
    return this.get<Subscription>('subscription', DEFAULT_SUBSCRIPTION);
  }

  static updateSubscription(sub: Partial<Subscription>): Subscription {
    const current = this.getSubscription();
    const updated = { ...current, ...sub };
    this.set('subscription', updated);
    return updated;
  }

  // --- Habits ---
  static getHabits(): Habit[] {
    return this.get<Habit[]>('habits', DEFAULT_HABITS);
  }

  static addHabit(name: string, frequency: 'daily' | 'weekly'): Habit {
    const habits = this.getHabits();
    const newHabit: Habit = {
      id: uuid(),
      user_id: 'user-default-123',
      name,
      frequency,
      streak: 0,
      last_completed: null,
      created_at: new Date().toISOString(),
    };
    habits.push(newHabit);
    this.set('habits', habits);
    return newHabit;
  }

  static toggleHabit(id: string): Habit[] {
    const habits = this.getHabits();
    const today = new Date().toISOString().split('T')[0];
    const updated = habits.map(habit => {
      if (habit.id === id) {
        if (habit.last_completed === today) {
          // Desfazer hoje
          return {
            ...habit,
            last_completed: null,
            streak: Math.max(0, habit.streak - 1)
          };
        } else {
          // Completar hoje
          return {
            ...habit,
            last_completed: today,
            streak: habit.streak + 1
          };
        }
      }
      return habit;
    });
    this.set('habits', updated);
    return updated;
  }

  static deleteHabit(id: string): Habit[] {
    const habits = this.getHabits().filter(h => h.id !== id);
    this.set('habits', habits);
    return habits;
  }

  // --- Goals ---
  static getGoals(): Goal[] {
    return this.get<Goal[]>('goals', DEFAULT_GOALS);
  }

  static addGoal(goal: Omit<Goal, 'id' | 'user_id' | 'status'>): Goal {
    const goals = this.getGoals();
    const newGoal: Goal = {
      ...goal,
      id: uuid(),
      user_id: 'user-default-123',
      status: 'in_progress',
    };
    goals.push(newGoal);
    this.set('goals', goals);
    return newGoal;
  }

  static updateGoalProgress(id: string, currentValue: number): Goal[] {
    const goals = this.getGoals();
    const updated = goals.map(g => {
      if (g.id === id) {
        const isCompleted = currentValue >= g.target_value;
        return {
          ...g,
          current_value: currentValue,
          status: isCompleted ? ('completed' as const) : ('in_progress' as const),
        };
      }
      return g;
    });
    this.set('goals', updated);
    return updated;
  }

  static deleteGoal(id: string): Goal[] {
    const goals = this.getGoals().filter(g => g.id !== id);
    this.set('goals', goals);
    return goals;
  }

  // --- Health Records ---
  static getHealthRecords(): HealthRecord[] {
    return this.get<HealthRecord[]>('health_records', DEFAULT_HEALTH).sort((a,b) => b.date.localeCompare(a.date));
  }

  static addHealthRecord(record: Omit<HealthRecord, 'id' | 'user_id'>): HealthRecord {
    const records = this.getHealthRecords();
    const newRec: HealthRecord = {
      ...record,
      id: uuid(),
      user_id: 'user-default-123'
    };
    records.push(newRec);
    this.set('health_records', records);
    return newRec;
  }

  static deleteHealthRecord(id: string): HealthRecord[] {
    const records = this.getHealthRecords().filter(r => r.id !== id);
    this.set('health_records', records);
    return records;
  }

  // --- Pregnancy Records ---
  static getPregnancyRecords(): PregnancyRecord[] {
    return this.get<PregnancyRecord[]>('pregnancy_records', DEFAULT_PREGNANCY).sort((a,b) => b.date.localeCompare(a.date));
  }

  static addPregnancyRecord(record: Omit<PregnancyRecord, 'id' | 'user_id'>): PregnancyRecord {
    const records = this.getPregnancyRecords();
    const newRec: PregnancyRecord = {
      ...record,
      id: uuid(),
      user_id: 'user-default-123'
    };
    records.push(newRec);
    this.set('pregnancy_records', records);
    return newRec;
  }

  // --- Meals ---
  static getMeals(): Meal[] {
    return this.get<Meal[]>('meals', DEFAULT_MEALS).sort((a,b) => b.date.localeCompare(a.date));
  }

  static addMeal(meal: Omit<Meal, 'id' | 'user_id'>): Meal {
    const meals = this.getMeals();
    const newMeal: Meal = {
      ...meal,
      id: uuid(),
      user_id: 'user-default-123'
    };
    meals.push(newMeal);
    this.set('meals', meals);
    return newMeal;
  }

  static deleteMeal(id: string): Meal[] {
    const meals = this.getMeals().filter(m => m.id !== id);
    this.set('meals', meals);
    return meals;
  }

  // --- Family Members ---
  static getFamilyMembers(): FamilyMember[] {
    return this.get<FamilyMember[]>('family_members', DEFAULT_FAMILY);
  }

  static addFamilyMember(member: Omit<FamilyMember, 'id' | 'user_id'>): FamilyMember {
    const family = this.getFamilyMembers();
    const newMem: FamilyMember = {
      ...member,
      id: uuid(),
      user_id: 'user-default-123'
    };
    family.push(newMem);
    this.set('family_members', family);
    return newMem;
  }

  static deleteFamilyMember(id: string): FamilyMember[] {
    const family = this.getFamilyMembers().filter(f => f.id !== id);
    this.set('family_members', family);
    return family;
  }

  // --- Transactions ---
  static getTransactions(): Transaction[] {
    return this.get<Transaction[]>('transactions', DEFAULT_TRANSACTIONS).sort((a,b) => b.date.localeCompare(a.date));
  }

  static addTransaction(trans: Omit<Transaction, 'id' | 'user_id'>): Transaction {
    const transactions = this.getTransactions();
    const newTrans: Transaction = {
      ...trans,
      id: uuid(),
      user_id: 'user-default-123'
    };
    transactions.push(newTrans);
    this.set('transactions', transactions);

    // Auto-update matched budget
    const budgets = this.getBudgets();
    const period = trans.date.substring(0, 7); // "AAAA-MM"
    if (trans.type === 'expense') {
      const budgetIdx = budgets.findIndex(b => b.category.toLowerCase() === trans.category.toLowerCase() && b.period === period);
      if (budgetIdx !== -1) {
        budgets[budgetIdx].spent_amount += trans.amount;
        this.set('budgets', budgets);
      }
    }

    return newTrans;
  }

  static deleteTransaction(id: string): Transaction[] {
    const transactions = this.getTransactions();
    const target = transactions.find(t => t.id === id);
    if (target && target.type === 'expense') {
      const budgets = this.getBudgets();
      const period = target.date.substring(0, 7);
      const budgetIdx = budgets.findIndex(b => b.category.toLowerCase() === target.category.toLowerCase() && b.period === period);
      if (budgetIdx !== -1) {
        budgets[budgetIdx].spent_amount = Math.max(0, budgets[budgetIdx].spent_amount - target.amount);
        this.set('budgets', budgets);
      }
    }
    const filtered = transactions.filter(t => t.id !== id);
    this.set('transactions', filtered);
    return filtered;
  }

  // --- Budgets ---
  static getBudgets(): Budget[] {
    return this.get<Budget[]>('budgets', DEFAULT_BUDGETS);
  }

  static addBudget(budget: Omit<Budget, 'id' | 'user_id' | 'spent_amount'>): Budget {
    const budgets = this.getBudgets();
    // Calculate current spent from existing transactions of this category + period
    const transactions = this.getTransactions();
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === budget.category.toLowerCase() && t.date.startsWith(budget.period))
      .reduce((sum, t) => sum + t.amount, 0);

    const newBudg: Budget = {
      ...budget,
      id: uuid(),
      user_id: 'user-default-123',
      spent_amount: spent,
    };
    budgets.push(newBudg);
    this.set('budgets', budgets);
    return newBudg;
  }

  static deleteBudget(id: string): Budget[] {
    const budgets = this.getBudgets().filter(b => b.id !== id);
    this.set('budgets', budgets);
    return budgets;
  }

  // --- Companies ---
  static getCompanies(): Company[] {
    return this.get<Company[]>('companies', DEFAULT_COMPANIES);
  }

  static updateCompany(company: Partial<Company>): Company {
    const companies = this.getCompanies();
    const idx = companies.findIndex(c => c.id === 'comp-default-abc');
    const updated = { ...companies[idx], ...company };
    companies[idx] = updated;
    this.set('companies', companies);
    return updated;
  }

  // --- Employees ---
  static getEmployees(): Employee[] {
    return this.get<Employee[]>('employees', DEFAULT_EMPLOYEES);
  }

  static addEmployee(emp: Omit<Employee, 'id' | 'company_id'>): Employee {
    const employees = this.getEmployees();
    const newEmp: Employee = {
      ...emp,
      id: uuid(),
      company_id: 'comp-default-abc'
    };
    employees.push(newEmp);
    this.set('employees', employees);
    return newEmp;
  }

  static updateEmployee(id: string, updates: Partial<Employee>): Employee[] {
    const employees = this.getEmployees();
    const updated = employees.map(e => e.id === id ? { ...e, ...updates } : e);
    this.set('employees', updated);
    return updated;
  }

  static deleteEmployee(id: string): Employee[] {
    const employees = this.getEmployees().filter(e => e.id !== id);
    this.set('employees', employees);
    return employees;
  }

  // --- Payroll ---
  static getPayroll(): Payroll[] {
    return this.get<Payroll[]>('payroll', DEFAULT_PAYROLL);
  }

  static addPayroll(payroll: Omit<Payroll, 'id'>): Payroll {
    const payrolls = this.getPayroll();
    const newPay: Payroll = {
      ...payroll,
      id: uuid(),
    };
    payrolls.push(newPay);
    this.set('payroll', payrolls);
    return newPay;
  }

  static processPayroll(employeeId: string, payPeriod: string): Payroll {
    const employees = this.getEmployees();
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) throw new Error('Funcionário não encontrado');

    const baseSalary = employee.salary;
    const bonuses = Math.round(baseSalary * 0.05); // Standard 5% mockup bonus
    const deductions = Math.round(baseSalary * 0.22); // Standard 22% taxes
    const netPay = baseSalary + bonuses - deductions;

    const payrolls = this.getPayroll();
    const newPay: Payroll = {
      id: uuid(),
      employee_id: employeeId,
      pay_period: payPeriod,
      base_salary: baseSalary,
      bonuses,
      deductions,
      net_pay: netPay,
      status: 'processed',
      processed_at: new Date().toISOString()
    };

    payrolls.push(newPay);
    this.set('payroll', payrolls);

    // Record as transaction expense
    this.addTransaction({
      type: 'expense',
      amount: netPay,
      category: 'Folha de Pagamento',
      date: new Date().toISOString().split('T')[0],
      description: `Salário Líquido Processado - ${employee.first_name} ${employee.last_name} (${payPeriod})`
    });

    return newPay;
  }

  static updatePayrollStatus(id: string, status: 'pending' | 'processed' | 'paid'): Payroll[] {
    const payrolls = this.getPayroll();
    const updated = payrolls.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status,
          processed_at: status !== 'pending' ? new Date().toISOString() : null
        };
      }
      return p;
    });
    this.set('payroll', updated);
    return updated;
  }

  // --- Products ---
  static getProducts(): Product[] {
    return this.get<Product[]>('products', DEFAULT_PRODUCTS);
  }

  static addProduct(prod: Omit<Product, 'id' | 'company_id'>): Product {
    const products = this.getProducts();
    const newProd: Product = {
      ...prod,
      id: uuid(),
      company_id: 'comp-default-abc'
    };
    products.push(newProd);
    this.set('products', products);

    // Auto-create inventory record
    const inventory = this.getInventory();
    inventory.push({
      id: uuid(),
      product_id: newProd.id,
      quantity: 100, // Initial default quantity
      location: 'Estoque Central',
      reorder_point: 10
    });
    this.set('inventory', inventory);

    return newProd;
  }

  static deleteProduct(id: string): Product[] {
    const products = this.getProducts().filter(p => p.id !== id);
    this.set('products', products);
    // clean inventory
    const inventory = this.getInventory().filter(i => i.product_id !== id);
    this.set('inventory', inventory);
    return products;
  }

  // --- Inventory ---
  static getInventory(): Inventory[] {
    return this.get<Inventory[]>('inventory', DEFAULT_INVENTORY);
  }

  static updateInventory(productId: string, quantity: number): Inventory[] {
    const inventory = this.getInventory();
    const updated = inventory.map(i => i.product_id === productId ? { ...i, quantity } : i);
    this.set('inventory', updated);
    return updated;
  }

  // --- Customers ---
  static getCustomers(): Customer[] {
    return this.get<Customer[]>('customers', DEFAULT_CUSTOMERS);
  }

  static addCustomer(cust: Omit<Customer, 'id' | 'company_id'>): Customer {
    const customers = this.getCustomers();
    const newCust: Customer = {
      ...cust,
      id: uuid(),
      company_id: 'comp-default-abc'
    };
    customers.push(newCust);
    this.set('customers', customers);
    return newCust;
  }

  static deleteCustomer(id: string): Customer[] {
    const customers = this.getCustomers().filter(c => c.id !== id);
    this.set('customers', customers);
    return customers;
  }

  // --- Sales ---
  static getSales(): Sale[] {
    return this.get<Sale[]>('sales', DEFAULT_SALES).sort((a,b) => b.date.localeCompare(a.date));
  }

  static addSale(sale: Omit<Sale, 'id' | 'company_id' | 'total_amount' | 'date'>): Sale {
    const products = this.getProducts();
    const product = products.find(p => p.id === sale.product_id);
    if (!product) throw new Error('Produto não encontrado');

    const totalAmount = product.price * sale.quantity;

    const sales = this.getSales();
    const newSale: Sale = {
      ...sale,
      id: uuid(),
      company_id: 'comp-default-abc',
      total_amount: totalAmount,
      date: new Date().toISOString()
    };
    sales.push(newSale);
    this.set('sales', sales);

    // Deduct stock inventory (for non-unlimited digital products)
    const inventory = this.getInventory();
    const invIdx = inventory.findIndex(i => i.product_id === sale.product_id);
    if (invIdx !== -1 && inventory[invIdx].quantity < 9999) {
      inventory[invIdx].quantity = Math.max(0, inventory[invIdx].quantity - sale.quantity);
      this.set('inventory', inventory);
    }

    // Record income transaction
    this.addTransaction({
      type: 'income',
      amount: totalAmount,
      category: 'Vendas SaaS',
      date: new Date().toISOString().split('T')[0],
      description: `Venda registrada #${newSale.id.substring(0,6).toUpperCase()} - ${product.name} (Qtde: ${sale.quantity})`
    });

    return newSale;
  }

  // --- Reports ---
  static getReports(): Report[] {
    return this.get<Report[]>('reports', DEFAULT_REPORTS);
  }

  static generateReport(type: 'financial' | 'sales' | 'inventory' | 'employees'): Report {
    const reports = this.getReports();
    let name = '';
    let reportData = {};

    if (type === 'financial') {
      name = 'Relatório de Margem e fluxo financeiro';
      const transactions = this.getTransactions();
      const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      reportData = { totalIncome: income, totalExpense: expense, netProfit: income - expense, margin: income > 0 ? ((income - expense) / income * 100).toFixed(1) : '0' };
    } else if (type === 'sales') {
      name = 'Desempenho Geral de Vendas ERP';
      const sales = this.getSales();
      const totalAmount = sales.reduce((sum, s) => sum + s.total_amount, 0);
      reportData = { totalSales: totalAmount, salesCount: sales.length, averageTicket: sales.length > 0 ? (totalAmount / sales.length).toFixed(2) : '0' };
    } else if (type === 'inventory') {
      name = 'Avaliação Física de Estoque de Produtos';
      const inventory = this.getInventory();
      const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);
      reportData = { totalStoredItems: totalItems, warningProducts: inventory.filter(i => i.quantity <= i.reorder_point).length };
    } else {
      name = 'Relatório de Folha de Pagamento e Capital Humano';
      const employees = this.getEmployees();
      const activeCount = employees.filter(e => e.status === 'active').length;
      const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
      reportData = { totalEmployees: employees.length, activeCount, monthlySalaryCost: totalSalary };
    }

    const newRep: Report = {
      id: uuid(),
      company_id: 'comp-default-abc',
      type,
      name,
      data: JSON.stringify(reportData),
      created_at: new Date().toISOString()
    };
    reports.push(newRep);
    this.set('reports', reports);
    return newRep;
  }

  // --- AI History ---
  static getAiHistory(): AiHistory[] {
    return this.get<AiHistory[]>('ai_history', DEFAULT_AI_HISTORY);
  }

  static addAiHistory(prompt: string, response: string, tokensUsed = 150, provider?: string): AiHistory {
    const history = this.getAiHistory();
    const newAi: AiHistory = {
      id: uuid(),
      user_id: 'user-default-123',
      prompt,
      response,
      created_at: new Date().toISOString(),
      tokens_used: tokensUsed,
      provider: provider
    };
    history.push(newAi);
    this.set('ai_history', history);
    return newAi;
  }

  // --- Notifications ---
  static getNotifications(): Notification[] {
    return this.get<Notification[]>('notifications', DEFAULT_NOTIFICATIONS);
  }

  static addNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Notification {
    const notifications = this.getNotifications();
    const newNot: Notification = {
      id: uuid(),
      user_id: 'user-default-123',
      title,
      message,
      read: false,
      type,
      created_at: new Date().toISOString()
    };
    notifications.unshift(newNot);
    this.set('notifications', notifications);
    return newNot;
  }

  static markNotificationRead(id: string): Notification[] {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.set('notifications', updated);
    return updated;
  }

  static clearAllNotifications(): Notification[] {
    this.set('notifications', []);
    return [];
  }

  static markAllNotificationsRead(): Notification[] {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    this.set('notifications', updated);
    return updated;
  }

  // --- EBooks / Learning Hub ---
  static getEBooks(): EBook[] {
    return this.get<EBook[]>('ebooks', []);
  }

  static saveEBook(ebook: EBook): EBook[] {
    const ebooks = this.getEBooks();
    const index = ebooks.findIndex(b => b.id === ebook.id);
    if (index >= 0) {
      ebooks[index] = { ...ebook, updated_at: new Date().toISOString() };
    } else {
      ebooks.push({
        ...ebook,
        views_count: 0,
        clicks_count: 0,
        recommendations_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    this.set('ebooks', ebooks);
    return ebooks;
  }

  static deleteEBook(id: string): EBook[] {
    const ebooks = this.getEBooks();
    const filtered = ebooks.filter(b => b.id !== id);
    this.set('ebooks', filtered);
    return filtered;
  }

  static incrementEBookView(id: string): void {
    const ebooks = this.getEBooks();
    const updated = ebooks.map(b => {
      if (b.id === id) {
        return { ...b, views_count: (b.views_count || 0) + 1 };
      }
      return b;
    });
    this.set('ebooks', updated);
  }

  static incrementEBookClick(id: string): void {
    const ebooks = this.getEBooks();
    const updated = ebooks.map(b => {
      if (b.id === id) {
        return { ...b, clicks_count: (b.clicks_count || 0) + 1 };
      }
      return b;
    });
    this.set('ebooks', updated);
  }

  static incrementEBookRecommendation(id: string): void {
    const ebooks = this.getEBooks();
    const updated = ebooks.map(b => {
      if (b.id === id) {
        return { ...b, recommendations_count: (b.recommendations_count || 0) + 1 };
      }
      return b;
    });
    this.set('ebooks', updated);
  }
}
