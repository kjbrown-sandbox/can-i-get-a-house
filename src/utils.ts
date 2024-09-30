export type UserInputs = {
    income: string | number;
    homePrice: string | number;
    downPayment: string | number;
};

export const calculatePMI = (
   homePrice: number,
   downPayment: number,
   monthlyCost: number,
   monthlyInterestRate: number
) => {
   const loanAmount = homePrice - downPayment;
   const pmiThreshold = homePrice * 0.78;
   let pmiMonthlyCost = (loanAmount * 0.015) / 12;

   let currentBalance = loanAmount;
   let months = 0;
   let totalPMICost = 0;
   while (currentBalance > pmiThreshold) {
      const interest = (currentBalance * monthlyInterestRate);
      currentBalance += interest;
      currentBalance -= monthlyCost;
      totalPMICost += pmiMonthlyCost;
      pmiMonthlyCost = (currentBalance * 0.015) / 12;
      months++;
   }

   return {
      months,
      cost: months * pmiMonthlyCost,
      totalPMICost,
   };
};

export const getMonthlyMortgagePayment = (mortgage: number, monthlyInterestRate: number) => {
   return (
      (mortgage * monthlyInterestRate) / (1 - (1 + monthlyInterestRate) ** -360)
   );
};

export const getAffordableHousePrice = (income: string | number, monthlyInterestRate: number): {
      homePrice: number;
      monthly: number;
      allCosts: Record<string, { cost: number; type: "percentage" | "fixed" }>;
   } => {
      if (typeof income !== "number") {
         return {
            homePrice: 0,
            monthly: 0,
            allCosts: {},
         };
      }

      type Cost = {
         cost: number;
         type: "percentage" | "fixed";
      };

      // https://www.ally.com/stories/home/cost-of-owning-a-home/
      let currentMortgagePrice = 0;
      const monthlyCosts: Record<string, Cost> = {
         utilities: { cost: 430, type: "fixed" },
         // maintenance: { cost: 0.02 / 12, type: "percentage" },
         // This is just for Utah
         propertyTaxes: { cost: 0.0052 / 12, type: "percentage" },
         // https://www.nerdwallet.com/article/insurance/average-homeowners-insurance-cost
         // I guess insurance is kinda complicated? And varies a lot by state
         insurance: { cost: 1915 / 12, type: "fixed" },
         // hoa: { cost: 191, type: "fixed" },
         // PMI is also complicated, but we'll just take the average percentage of some rates and come back to this
         // PMI is just a fee you pay until you hit over 20% equity in your home (or maybe 22% ???)
         // M = P [ I(1 + I)N ] / [ (1 + I)N − 1]
         mortgage: {
            cost: getMonthlyMortgagePayment(
               currentMortgagePrice,
               monthlyInterestRate
            ),
            type: "fixed",
         },
      };

      const mortgageDelta = income / 100;
      while (true) {
         const totalCost = Object.values(monthlyCosts).reduce(
            (acc, { cost, type }) => {
               if (type === "percentage") {
                  return acc + cost * currentMortgagePrice;
               } else {
                  return acc + cost;
               }
            },
            0
         );

         if (totalCost > (income * 0.3) / 12) {
            // console.log(monthlyCosts);
            return {
               homePrice: currentMortgagePrice,
               monthly: totalCost,
               allCosts: monthlyCosts,
            };
         } else {
            currentMortgagePrice += mortgageDelta;
            monthlyCosts.mortgage.cost = getMonthlyMortgagePayment(
               currentMortgagePrice,
               monthlyInterestRate
            );
         }
      }
   };
