import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const dummy = {
  "message": "Uploaded Successfully!",
  "file": {
      "name": "image.jpg",
      "size": 1024,
      "type": "image/jpeg"
  },
  "receipt": {
      "items": [
          {
              "name": "bananas",
              "price": 1.25,
              "category": "fruit"
          },
          {
              "name": "apples",
              "price": 2.50,
              "category": "fruit"
          },
          {
              "name": "milk",
              "price": 3.00,
              "category": "dairy"
          },
          {
              "name": "bread",
              "price": 2.25,
              "category": "bakery"
          },
          {
              "name": "eggs",
              "price": 2.00,
              "category": "dairy"
          },
          {
            "name": "crackers",
            "price": 3.00,
            "category": "snacks"
          },
          {
            "name": "toothbrush",
            "price": 2.00,
            "category": "hygiene"
          },
          {
            "name": "toothpaste",
            "price": 2.00,
            "category": "hygiene"
          },
          {
            "name": "shampoo",
            "price": 2.00,
            "category": "hygiene"
          }
      ],
      "tax": 5.00,
      "subtotal": 11.00,
      "total": 16.00,
      "payment_method": "cash",
      "cashback": 0.24
  }
}


const Items = () => {
  const categories = {};
  const categoryTotals = {};

  // Group items by category
  dummy.receipt.items.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
      categoryTotals[item.category] = 0;
    }
    categories[item.category].push(item);
    categoryTotals[item.category] += item.price;
  });

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
        <h1 className="text-6xl font-bold mb-4 p-6 pb-0">Your Trip Breakdown</h1>
        <div className="text-2xl font-bold p-4">
          Total: ${dummy.receipt.total.toFixed(2)}
        </div>
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
        {dummy.receipt.cashback > 0 && (
          <div className="mt-4 text-center text-lg text-gray-700 max-w-xl mx-auto italic bg-red-100 p-4 rounded-full">
            Since you used {dummy.receipt.payment_method}, you earned ${dummy.receipt.cashback.toFixed(2)} cash back from this purchase. See the <a href="/insights" className="text-blue-500 underline hover:text-blue-600 font-bold">insights page</a> for investment opportunities.
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;