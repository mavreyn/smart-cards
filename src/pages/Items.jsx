import React from 'react';
import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useUploadContext } from '../context/UploadContext';
ChartJS.register(ArcElement, Tooltip, Legend);

const Items = () => {
  const [categories, setCategories] = useState({});
  const [categoryTotals, setCategoryTotals] = useState({});
  const { uploadResponse } = useUploadContext();

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

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56'
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56'
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Spending by Category',
      },
    },
  };

  return (
    <div>
      <div className="flex flex-col items-center">
        <h1 className="text-6xl font-bold mb-4 p-6 pb-0">Transaction Breakdown</h1>
        {uploadResponse && uploadResponse.receipt && uploadResponse.receipt.items.length > 0 ? (
          <>
            <p className="text-2xl italic">Total: ${uploadResponse.receipt.total.toFixed(2)}</p>
            <p className="text-2xl italic pb-2">Payment Method: {uploadResponse.receipt.payment_method}</p>
            <div className="flex flex-col lg:flex-row justify-center items-start gap-8 w-full max-w-6xl">
              <div className="m-2 bg-white p-10 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-3/5">
                {Object.keys(categories).map(category => (
                  <div key={category} className="border p-6 rounded-lg shadow-md bg-gray-100 hover:bg-gray-200 transition-colors duration-300">
                    <h2 className="text-xl font-bold mb-2">{category}</h2>
                    <ul>
                      {categories[category].map((item, index) => (
                        <li key={index} className="mb-1">
                          {item.name}: ${item.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="w-full lg:w-2/5">
                <Pie data={chartData} options={chartOptions} />
              </div>
            </div>
            {uploadResponse.receipt.cashback > 0 && (
              <div className="mt-4 m-4 text-center text-lg text-gray-700 max-w-xl mx-auto italic bg-red-100 p-4 rounded-full">
                Since you used {uploadResponse.receipt.payment_method}, you earned ${uploadResponse.receipt.cashback.toFixed(2)} cash back from this purchase. See the insights page for investment opportunities.
              </div>
            )}
          </>
        ) : (
          <div className="text-2xl font-bold p-4">
            Upload a receipt to get started
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;