![SmartCards Banner](src/assets/SmartCards_Banner.png)

_SmartCards_ is a user-friendly addon for your budgeting app to help you better categorize your transactions and find investing opportunities from each purchase. Simply upload a picture of any receipt and our GenAI technology will organize your purchases while providing insights to help your financial future.

## Features

- Intelligent transaction categorization
- Investment opportunity identification
- Seamless integration with existing budgeting apps
- User-friendly interface

## Installation

To get started with _SmartCards_, run the following

```bash
git clone https://github.com/mavreyn/smart-cards.git
cd smart-cards
npm i
```

## Usage

To run _SmartCards_:

Start the express server
```bash
node server/server.js
```
And the Python server
```bash
python server.py
```
And the live development server
```bash
npm run dev
```

Then navigate to `http://localhost:3000` in your browser to access the _SmartCards_ interface

## Walkthrough

On starting _SmartCards_, you'll be greeted with a clean, intuitive interface. Here's a quick guide to get you started:

1. **Upload Receipt**: Click on the "Upload" button to scan or upload a picture of your receipt.
2. **Items**: Click on the "Items" button to see our GenAI categorize your purchased products/services by their expense type
3. **Insights**: Check the "Insights" tabs to see personalized investing opportunities and recommendations to modify existing spending habits to help you stack more cash!


## Future Ambitions

We're constantly working to improve _SmartCards_. Here are some features we're excited about for future releases:

- Machine learning models for even more accurate transaction categorization
- Integration with major financial institutions for real-time transaction updates
- Mobile app for on-the-go receipt scanning and financial management
- Improved investment opportunity detection
- Social features for comparing anonymized spending habits with peers

## Acknowledgements

- Much thanks to Kevin & Sri for their amazing contributions to SmartCards. Their insights on properly catering our product to company challenges are greatly appreciated.

- AI model powered by [OpenAI](https://openai.com/)
- Built with [React](https://reactjs.org/), [Node.js](https://nodejs.org/), and [Tailwind CSS](https://tailwindcss.com/)
