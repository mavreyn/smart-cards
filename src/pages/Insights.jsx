import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useUploadContext } from '../context/UploadContext';

import creditCards from '../creditCard.js';
import creditCardRecommendations from '../creditCardRecommendations.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Insights = () => {
  const { uploadResponse } = useUploadContext();
  const [categories, setCategories] = useState({});
  const [categoryTotals, setCategoryTotals] = useState({});

  const noItems = !uploadResponse || !uploadResponse.receipt || !uploadResponse.receipt.items || uploadResponse.receipt.items.length === 0;

  // Use useEffect to update the component when the context changes
  useEffect(() => {
    if (uploadResponse && uploadResponse.receipt && uploadResponse.receipt.items) {
      const newCategories = {};
      const newCategoryTotals = {};

      uploadResponse.receipt.items.forEach(item => {
        if (!newCategories[item.category]) {
          newCategories[item.category] = [];
          newCategoryTotals[item.category] = 0;
        }
        newCategories[item.category].push(item);
        newCategoryTotals[item.category] += item.price;
      });

      setCategories(newCategories);
      setCategoryTotals(newCategoryTotals);
    }
  }, [uploadResponse]);

  if (noItems) {
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-6xl font-bold mb-4 p-6 pb-0">Investment Insights</h1>
        <div className="text-2xl font-bold p-4 text-center">Upload a receipt to get started!</div>
      </div>
    )
  }

  const years = Array.from({ length: 30 }, (_, i) => i + 1); // 30 years
  const growthRate = 0.10; // 8% per year
  const initialAmount = uploadResponse.receipt.cashback * 52; // $1 initial amount
  const finalAmount = initialAmount * Math.pow(1 + growthRate, 30) + 30 * uploadResponse.receipt.cashback * 52;
  console.log(categories);
  // Find the category with the most items
  const categoryWithMostItems = Object.entries(categories).reduce((max, [category, items]) => {
    return items.length > max.count ? { category, count: items.length } : max;
  }, { category: '', count: 0 });

  console.log(`Category with most items: ${categoryWithMostItems.category} (${categoryWithMostItems.count} items)`);

  const data = {
    labels: years,
    datasets: [
      {
        label: 'Compounding Value',
        data: years.map(year => initialAmount * Math.pow(1 + growthRate, year) + year * uploadResponse.receipt.cashback * 52),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Regular Cashback Investments & Exponential Growth',
      },
    },
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-6xl font-bold mb-4 p-6 pb-0">Investment Insights</h1>
      {noItems ? (
        <div className="text-2xl font-bold p-4 text-center">
          Upload a receipt to get started!
        </div>
      ) : (
        <>
        <div className="w-full max-w-6xl grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-200 p-4 rounded-lg drop-shadow-lg">
            <p className="mb-4">Remember to leave some bread for your future self & future family! Weekly cashback investments as small as ${uploadResponse.receipt.cashback.toFixed(2)} invested in Vanguard's S&P 500 Index can add up to ${finalAmount.toFixed(2)} in 30 years. <a href="https://www.investopedia.com/articles/00/082100.asp" className="text-blue-500 underline hover:text-blue-600 font-bold">Learn more</a></p>
            <Line data={data} options={options} />
            <h3 className="text-lg font-bold mb-2 text-center">Start Your Investing Journey Here:</h3>
          
          <div className="mt-4 flex justify-center space-x-4">
            <a href="https://www.fidelity.com/" target="_blank" rel="noopener noreferrer">
              <img src="src/assets/fidelity_btn.png" alt="Fidelity" className="h-12 w-auto hover:opacity-80 transition-opacity rounded-full" />
            </a>
            <a href="https://investor.vanguard.com/" target="_blank" rel="noopener noreferrer">
              <img src="src/assets/vanguard_btn.png" alt="Vanguard" className="h-12 w-auto hover:opacity-80 transition-opacity rounded-full" />
            </a>
          </div>
          </div>
          <div className="bg-gray-200 p-4 rounded-lg drop-shadow-lg">
            {categoryWithMostItems.category && (
              <div>
                <h2 className="text-xl font-bold mb-2">Credit Card Recommendations</h2>
                <p className="mb-4">Building credit is a great way to get access to mortgages, car loans, and other forms of credit. The following card(s) may help maximize your cashback on purchases in: {categoryWithMostItems.category}</p>
                {creditCardRecommendations[categoryWithMostItems.category] && (
                  <ul>
                    {creditCardRecommendations[categoryWithMostItems.category].cards.map((card, index) => (
                      <li key={index} className="mb-2">
                        <span className="font-semibold">{card}</span>
                        {creditCards[card] && (
                          <div className="flex items-center justify-center">
                            <div className="flex flex-col items-center">
                              <span className="mb-2"> - {(creditCards[card].cashback * 100).toFixed(1)}% cashback on selected purchases</span>
                              <img src={`src/${creditCards[card].img}`} alt={card} className="w-full h-auto mx-auto" />
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
         <div className="bg-gray-200 p-4 rounded-lg drop-shadow-lg max-w-6xl mb-12">
         <h2 className="text-xl font-bold mb-2">Community and Minority-Owned Business Investing</h2>
         <p className="mb-4">
           While personal investing is important, consider the power of community investing and supporting minority-owned businesses and funds. These investments can lead to positive social impact, economic growth in underserved areas, and potentially strong financial returns. By directing capital to diverse entrepreneurs and communities, you can help create jobs, foster innovation, and promote economic equality. Many socially responsible investment (SRI) funds and community development financial institutions (CDFIs) offer opportunities to align your investments with your values while still pursuing financial goals.
         </p>
         <p>
           To learn more about impact investing and find opportunities, check out resources like:
           <ul className="list-disc list-inside mt-2">
             <li><a href="https://www.investopedia.com/terms/c/community_investing.asp" className="text-blue-500 underline hover:text-blue-600">Community Investing Guide</a></li>
             <li><a href="https://www.forbes.com/advisor/investing/socially-responsible-investing/" className="text-blue-500 underline hover:text-blue-600">Socially Responsible Investing</a></li>
             <li><a href="https://www.cdfi.org/about-cdfis/what-are-cdfis/" className="text-blue-500 underline hover:text-blue-600">Community Development Financial Institutions</a></li>
           </ul>
         </p>
         <div className="mt-4">
           <button
             className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
             onClick={() => window.open('https://www.cdfifund.gov/tools-resources/mapping-tools', '_blank')}
           >
             Find CDFIs in Your Community
           </button>
         </div>
       </div>
    </>
      )}
    </div>
  );
};

export default Insights;