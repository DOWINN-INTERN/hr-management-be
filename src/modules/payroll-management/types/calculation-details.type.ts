// Base interface for all calculation details
export interface BaseCalculationDetails {
    calculationType: string;
}

// SSS calculation details
export interface SSSCalculationDetails extends BaseCalculationDetails {
    calculationType: 'SSS';
    baseAmount: number;
    msc: number;
    employeeRate: string;
    employerRate: string;
    employeeContribution: number;
    employerContribution: number;
    ecContribution: number;
    totalContribution: number;
}

// PhilHealth calculation details
export interface PhilHealthCalculationDetails extends BaseCalculationDetails {
    calculationType: 'PHILHEALTH';
    baseAmount: number;
    computationBase: number;
    employeeRate: string;
    employerRate: string;
    employeeContribution: number;
    employerContribution: number;
    totalContribution: number;
}

// Pag-IBIG calculation details
export interface PagIbigCalculationDetails extends BaseCalculationDetails {
    calculationType: 'PAGIBIG';
    baseAmount: number;
    computationBase: number;
    employeeRate: string;
    employerRate: string;
    employeeContribution: number;
    employerContribution: number;
    totalContribution: number;
}

// Tax calculation details
export interface WithholdingTaxCalculationDetails extends BaseCalculationDetails {
    calculationType: 'WITHHOLDING_TAX';
    monthlyTaxableIncome: number;
    annualTaxableIncome: number;
    annualTax: number;
    monthlyTax: number;
}

// 13th month calculation details
export interface ThirteenthMonthCalculationDetails extends BaseCalculationDetails {
    calculationType: 'THIRTEENTH_MONTH';
    totalNetPay: number;
    thirteenthMonthPay: number;
}

// Default calculation details
export interface DefaultCalculationDetails extends BaseCalculationDetails {
    calculationType: 'DEFAULT';
    amount: number;
}

// Union type of all possible calculation details
export type CalculationDetails = 
    | SSSCalculationDetails 
    | PhilHealthCalculationDetails 
    | PagIbigCalculationDetails 
    | WithholdingTaxCalculationDetails
    | ThirteenthMonthCalculationDetails
    | DefaultCalculationDetails;