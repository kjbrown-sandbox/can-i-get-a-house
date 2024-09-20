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


export const App: React.FC = () => {
  const [income, setIncome] = useState<number | string>("");
  const currentMortgageInterestRate = 0.0631

  const getAffordableHousePrice = () => {
   if (typeof income !== 'number') {
      return 0;
   }

   type Cost = {
      cost: number;
      type: 'percentage' | 'fixed';
   }

   // https://www.ally.com/stories/home/cost-of-owning-a-home/
   let currentMortgagePrice = 0;
   const monthlyCosts: Record<string, Cost> = {
      utilities: { cost: 430, type: 'fixed' },
      maintenance: { cost: 0.0275, type: 'percentage' },
      // This is just for Utah
      propertyTaxes: { cost: 0.0052 / 12, type: 'percentage' },
      // https://www.nerdwallet.com/article/insurance/average-homeowners-insurance-cost
      // I guess insurance is kinda complicated? And varies a lot by state
      insurance: { cost: 1915 / 12, type: 'fixed' },
      hoa: { cost: 191, type: 'fixed' },
      // PMI is also complicated, but we'll just take the average percentage of some rates and come back to this
      // PMI is just a fee you pay until you hit over 20% equity in your home (or maybe 22% ???)
      pmi: { cost: 0.01 / 12, type: 'percentage' }, 
      // M = P [ I(1 + I)N ] / [ (1 + I)N − 1]
      mortgage: { cost: currentMortgagePrice * (currentMortgageInterestRate * (1 + currentMortgageInterestRate) ** 30) / ((1 + currentMortgageInterestRate) ** 30 - 1), type: 'fixed' }
   }

   while (true) {
      const totalCost = Object.values(monthlyCosts).reduce((acc, { cost, type }) => {
         if (type === 'percentage') {
            return acc + (cost * currentMortgagePrice);
         } else {
            return acc + cost;
         }
      }, 0);

      if (totalCost > income * 0.3) {
         return currentMortgagePrice;
      } else {
         currentMortgagePrice += 100
         monthlyCosts.mortgage.cost = currentMortgagePrice * (currentMortgageInterestRate * (1 + currentMortgageInterestRate) ** 30) / ((1 + currentMortgageInterestRate) ** 30 - 1)
      }
   }
}

console.log('getting price')
console.log(getAffordableHousePrice())

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || !isNaN(Number(value))) {
      setIncome(Number(value));
    }
  };

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
        <div>This is a second box</div>
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
*/
