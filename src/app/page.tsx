// import Image from "next/image";
// import styles from "./page.module.css";

// export default function Home() {
//   return (
//     <div className={styles.page}>
//       <main className={styles.main}>
//         <Image
//           className={styles.logo}
//           src="https://nextjs.org/icons/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol>
//           <li>
//             Get started by editing <code>src/app/page.tsx</code>.
//           </li>
//           <li>Save and see your changes instantly.</li>
//         </ol>

//         <div className={styles.ctas}>
//           <a
//             className={styles.primary}
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className={styles.logo}
//               src="https://nextjs.org/icons/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//             className={styles.secondary}
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className={styles.footer}>
//         <a
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="https://nextjs.org/icons/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import "./globals.css";

const currentMortgageInterestRate = 0.0631;
const calculatePMI = (
   homePrice: number,
   downPayment: number,
   monthlyCost: number
) => {
   const loanAmount = homePrice - downPayment;
   const pmiThreshold = homePrice * 0.78;
   let pmiMonthlyCost = (loanAmount * 0.015) / 12;

   let currentBalance = loanAmount;
   let months = 0;
   let totalPMICost = 0;
   while (currentBalance > pmiThreshold) {
      const interest = (currentBalance * currentMortgageInterestRate) / 12;
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

const getMonthlyMortgagePayment = (mortgage: number, interestRate: number) => {
   return (
      (mortgage * interestRate) / 12 / (1 - (1 + interestRate / 12) ** -360)
   );
};

export const App: React.FC = () => {
   const [income, setIncome] = useState<number | string>("");

   const getAffordableHousePrice = (): {
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
         maintenance: { cost: 0.02 / 12, type: "percentage" },
         // This is just for Utah
         propertyTaxes: { cost: 0.0052 / 12, type: "percentage" },
         // https://www.nerdwallet.com/article/insurance/average-homeowners-insurance-cost
         // I guess insurance is kinda complicated? And varies a lot by state
         insurance: { cost: 1915 / 12, type: "fixed" },
         hoa: { cost: 191, type: "fixed" },
         // PMI is also complicated, but we'll just take the average percentage of some rates and come back to this
         // PMI is just a fee you pay until you hit over 20% equity in your home (or maybe 22% ???)
         // M = P [ I(1 + I)N ] / [ (1 + I)N − 1]
         mortgage: {
            cost: getMonthlyMortgagePayment(
               currentMortgagePrice,
               currentMortgageInterestRate
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
               currentMortgageInterestRate
            );
         }
      }
   };

   console.log("getting price");
   console.log(getAffordableHousePrice());

   const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
         setIncome(value);
      } else if (!isNaN(Number(value))) {
         setIncome(Math.min(Number(value), 10000000));
      }
   };

   let { homePrice, monthly, allCosts } = getAffordableHousePrice();
   homePrice = Math.round(homePrice);
   monthly = Math.round(monthly);

   let {
      cost: pmiCost,
      months,
      totalPMICost,
   } = calculatePMI(homePrice, homePrice * 0.1, monthly);
   pmiCost = Math.round(pmiCost);
   totalPMICost = Math.round(totalPMICost);

   return (
      <div className={styles.page}>
         <div className={styles.leftPanel}>
            <input
               type="text"
               placeholder="Enter your income"
               value={income}
               onChange={handleIncomeChange}
            />
         </div>
         <div className={styles.rightPanel}>
            <p>{homePrice}</p>
            <p>
               At 10% down, you would pay ${pmiCost} in PMI over the course of{" "}
               {months} months with an average of $
               {totalPMICost ? Math.round(totalPMICost / months) : 0} per month.
            </p>
            <br/>
            <p>
               Here is your monthly breakdown of costs:
            </p>
            {Object.keys(allCosts).map((key) => {
               let keyCost = 0;
               if (allCosts[key].type === "percentage") {
                  keyCost = Math.round(allCosts[key].cost * homePrice);
               } else {
                  keyCost = Math.round(allCosts[key].cost);
               }
               return (
                  <p key={key}>
                     {key}: ${keyCost}
                  </p>
               );
            })}
         </div>
      </div>
   );
};
export default App;

/*
A house should be 30% of your gross income but should include all costs associated with the house.
Costs include:
- utilities
- maintenance
- property taxes
- insurance
- mortgage (obviously)
- HOA fees
- PMI

We can add in different methods to be more or less conservative (like 30% of net income or even a 15-year mortgage)
or other rules


The reason PMI length in months to repay goes up as mortgage cost goes up is because,
as mortgage cost goes up, the relative fixed costs of the house go down. (A fixed $400 cost
for utilities means a lot less when your mortgage is $2000 than when it's $1000.) Why does
that matter? Well, imagine there was no interest. If you pay 0% down, then you'd need 20% of
the time to get to 20% equity. But when you add in interest, the beginning time is heavily
skewed towards only paying down interest--which means it takes longer than 20% of the time to
get to 20% equity. As interest starts playing a bigger factor, the fixed costs have less weight,
so you spend more time just paying interest, which means you spend more time paying PMI because
it takes longer to get to 20% equity.
*/
