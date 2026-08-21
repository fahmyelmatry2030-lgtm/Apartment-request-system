export interface PaymentDetails {
  bank: {
    bankName: string;
    bankNameEn: string;
    accountName: string;
    accountNameEn?: string;
    accountNumber: string;
    iban: string;
  };
  instapay: {
    accountName: string;
    number: string;
  };
  vodafoneCash: {
    accountName: string;
    number: string;
  };
}

export const PAYMENT_DETAILS: PaymentDetails = {
  bank: {
    bankName: 'البنك الأهلي المصري',
    bankNameEn: 'National Bank of Egypt',
    accountName: 'مدحت عزالدين',
    accountNameEn: 'Medhat Ezz Eldin',
    accountNumber: '1385171656685100017',
    iban: 'EG620003013851716566851000170',
  },
  instapay: {
    accountName: 'مدحت عزالدين',
    number: '01005318003',
  },
  vodafoneCash: {
    accountName: 'محمود علي',
    number: '01021691745',
  },
};
