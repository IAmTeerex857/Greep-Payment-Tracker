## **Product Requirements Document (PRD)**

### **1\. Purpose & Scope**

Build a web‑based “Greep Drivers Payment Tracker” to centrally record driver remittances, investor payouts, and all related expenses—enabling transparent tracking of cash flows and automated profit calculations.

### **2\. Users & Permissions**

| Role | Permissions |
| ----- | ----- |
| Admin | • Add/Remove Drivers & Investors • Record driver payments weekly • Record expenses (any category) • View reports & dashboards (revenue, payouts, profit) • Manage system settings |
| Driver | • (Read‑only) View their own payment history and outstanding balance |
| Investor | • (Read‑only) View their own scheduled payouts and expense deductions |

### **3\. Key Features**

1. **Driver Payment Recording**

   * Weekly payment entry per driver

   * Automatic carry‑forward of any unpaid balance

   * Monthly aggregation of total remittances

2. **Investor Payout Scheduling**

   * Monthly fixed payout per tier (15,000 TL or 16,500 TL)

   * Ability to record investor‑incurred expenses, auto‑deducted from payout

   * Payment status tracking (pending, paid)

3. **Expense Management**

   * Expense entry form: amount, date, description, and “Paid By” tag (Admin/Investor/Driver)

   * Separate ledgers for each segment

   * Link expenses to individual users

4. **Financial Dashboard & Reporting**

   * **Revenue Report**: breakdown by driver, week, and month

   * **Expenses Report**: filterable by segment and date range

   * **Payout Report**: investor-by-investor summary of gross vs. net payout

   * **Profit Summary**: Total Revenue – Investor Payouts – Admin Expenses

5. **Roster Administration**

   * CRUD interface for Drivers & Investors

   * Tier assignment (A/B for drivers; X/Y for investors)

   * Bulk import/export (CSV)

### **4\. Data Model (High‑Level)**

* **User** (base table)

  * `user_id`, `name`, `role` (“driver”/“investor”), `tier` (“A”/“B” or “X”/“Y”)

* **DriverPayment**

  * `payment_id`, `driver_id`, `week_start_date`, `amount_paid`, `balance_carryover`

* **InvestorExpense**

  * `expense_id`, `investor_id`, `date`, `amount`, `description`

* **AdminExpense**

  * `expense_id`, `date`, `amount`, `description`

* **DriverExpense**

  * `expense_id`, `driver_id`, `date`, `amount`, `description`

* **InvestorPayout**

  * `payout_id`, `investor_id`, `month`, `gross_amount`, `total_expenses`, `net_amount`, `status`

### **5\. Functional Requirements**

* **FR1**: Admin can log weekly payments; system updates driver’s monthly total and balance.

* **FR2**: Admin can log expenses, specifying segment and (if applicable) user.

* **FR3**: System auto‑calculates investor net payouts each month.

* **FR4**: Dashboard displays real‑time financial KPIs.

* **FR5**: Admin can add/remove users and change their tier assignments.

* **FR6**: CSV import/export for drivers and investors roster.

### **6\. Non‑Functional Requirements**

* **NFR1**: Secure authentication & role‑based access control.

* **NFR2**: Responsive UI for desktop and tablet use.

* **NFR3**: Audit logging of all entries (who/when).

* **NFR4**: Data backup & export for accounting compliance.

