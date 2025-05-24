#!/usr/bin/env node

import readline from 'readline';
import { TravelChatbotApp } from './src/index.js';

/**
 * Simple CLI Interface for Travel Chatbot
 */

class TravelChatbotCLI {
  constructor() {
    this.app = new TravelChatbotApp();
    this.rl = null;
    this.isRunning = false;
    this.isInitialized = false;
  }

  /**
   * Initialize the CLI interface
   */
  async initialize() {
    try {
      console.log('🚀 Initializing Travel Chatbot CLI...\n');

      // Initialize the chatbot app
      const success = await this.app.initialize();
      if (!success) {
        console.error('❌ Failed to initialize chatbot app');
        return false;
      }

      // Setup readline interface
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '\n🧳 You: '
      });

      // Setup event handlers
      this.setupEventHandlers();

      this.isInitialized = true;
      console.log('\n✅ CLI initialized successfully!');
      return true;

    } catch (error) {
      console.error('❌ CLI initialization failed:', error.message);
      return false;
    }
  }

  /**
   * Setup readline event handlers
   */
  setupEventHandlers() {
    // Handle user input
    this.rl.on('line', async (input) => {
      await this.handleUserInput(input.trim());
    });

    // Handle Ctrl+C
    this.rl.on('SIGINT', () => {
      this.handleExit();
    });

    // Handle close
    this.rl.on('close', () => {
      this.handleExit();
    });
  }

  /**
   * Handle user input
   * @param {string} input - User input
   */
  async handleUserInput(input) {
    if (!input.trim()) {
      this.rl.prompt();
      return;
    }

    const trimmedInput = input.trim();

    // Handle special commands
    if (this.handleSpecialCommands(trimmedInput)) {
      return;
    }

    try {
      // Process the message
      console.log('\n🔄 Processing your request...');
      const result = await this.app.processMessage(trimmedInput);

      // Display the response
      console.log('\n🤖 Assistant:');
      console.log(result.response);

      // Display metadata if available
      if (result.metadata) {
        const meta = result.metadata;
        let metaInfo = [];
        if (meta.category && meta.category !== 'N/A') metaInfo.push(`Category: ${meta.category}`);
        if (meta.location && meta.location !== 'N/A') metaInfo.push(`Location: ${meta.location}`);
        if (meta.searchResultsCount > 0) metaInfo.push(`Search Results: ${meta.searchResultsCount}`);

        if (metaInfo.length > 0) {
          console.log(`\n📋 Metadata: ${metaInfo.join(' | ')}`);
        }
      }

    } catch (error) {
      console.error('\n❌ Error processing message:', error.message);
      console.log('Please try again or type "help" for assistance.');
    }

    // Prompt for next input
    this.rl.prompt();
  }

  /**
   * Handle special commands
   * @param {string} input - User input
   * @returns {boolean} True if command was handled
   */
  handleSpecialCommands(input) {
    const command = input.toLowerCase();

    switch (command) {
      case 'exit':
      case 'quit':
      case 'bye':
        this.handleExit();
        return true;

      case 'help':
        this.displayHelp();
        this.rl.prompt();
        return true;

      case 'clear':
      case 'reset':
        this.app.clearHistory();
        console.log('🗑️ Conversation history cleared!\n');
        this.rl.prompt();
        return true;

      case 'history':
        this.displayHistory();
        this.rl.prompt();
        return true;

      case 'summary':
        this.app.displaySummary();
        this.rl.prompt();
        return true;

      case 'examples':
        this.displayExamples();
        this.rl.prompt();
        return true;

      default:
        return false;
    }
  }

  /**
   * Display help information
   */
  displayHelp() {
    console.log('\n📚 Help - Available Commands:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 help      - Show this help message');
    console.log('🔹 examples  - Show example questions');
    console.log('🔹 history   - Show conversation history');
    console.log('🔹 summary   - Show conversation summary');
    console.log('🔹 clear     - Clear conversation history');
    console.log('🔹 exit      - Exit the chatbot');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Just type your travel question to get started!\n');
  }

  /**
   * Display example questions
   */
  displayExamples() {
    console.log('\n💡 Example Questions:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🍽️ Food & Dining:');
    console.log('   • "Best sushi restaurants in Tokyo"');
    console.log('   • "Vegetarian food options in Mumbai"');
    console.log('   • "Local street food in Bangkok"');
    console.log('');
    console.log('🏨 Accommodation:');
    console.log('   • "Budget hotels near Central Park NYC"');
    console.log('   • "Luxury resorts in Maldives"');
    console.log('   • "Hostels in Amsterdam city center"');
    console.log('');
    console.log('🗺️ Attractions:');
    console.log('   • "Top 10 things to do in Paris"');
    console.log('   • "Museums in London"');
    console.log('   • "Outdoor activities in New Zealand"');
    console.log('');
    console.log('🌤️ Weather:');
    console.log('   • "Weather in Bali this week"');
    console.log('   • "Best time to visit Japan"');
    console.log('   • "Current temperature in Dubai"');
    console.log('');
    console.log('🚗 Transportation:');
    console.log('   • "How to get from JFK to Manhattan"');
    console.log('   • "Public transport in Singapore"');
    console.log('   • "Train from London to Paris"');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Display conversation history
   */
  displayHistory() {
    const history = this.app.getHistory();

    if (history.length === 0) {
      console.log('\n📝 No conversation history available.\n');
      return;
    }

    console.log('\n📝 Conversation History:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    history.forEach((message, index) => {
      const time = new Date(message.timestamp).toLocaleTimeString();
      const role = message.role === 'user' ? '👤 You' : '🤖 Assistant';

      console.log(`\n[${time}] ${role}:`);
      console.log(message.content);

      if (message.metadata && Object.keys(message.metadata).length > 0) {
        const meta = message.metadata;
        let metaInfo = [];
        if (meta.category) metaInfo.push(`Category: ${meta.category}`);
        if (meta.location) metaInfo.push(`Location: ${meta.location}`);
        if (metaInfo.length > 0) {
          console.log(`   📋 ${metaInfo.join(' | ')}`);
        }
      }
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Handle exit
   */
  handleExit() {
    if (this.isRunning) {
      console.log('\n👋 Thank you for using Travel Chatbot!');
      this.app.displaySummary();
      console.log('Have a great trip! 🌟\n');

      if (this.rl) {
        this.rl.close();
      }

      this.isRunning = false;
      process.exit(0);
    }
  }

  /**
   * Start the CLI interface
   */
  async start() {
    const initialized = await this.initialize();
    if (!initialized) {
      console.log('❌ Failed to start chatbot. Please check your configuration.');
      process.exit(1);
    }

    this.isRunning = true;

    // Display welcome message
    this.displayWelcome();

    // Start the prompt
    this.rl.prompt();
  }

  /**
   * Display welcome message
   */
  displayWelcome() {
    console.log('\n🌟 Welcome to Travel Chatbot! 🌟');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧳 I can help you with:');
    console.log('   🍽️  Restaurant recommendations');
    console.log('   🏨  Hotel and accommodation suggestions');
    console.log('   🗺️  Tourist attractions and activities');
    console.log('   🌤️  Weather information');
    console.log('   🚗  Transportation options');
    console.log('');
    console.log('💡 Type "help" for commands or "examples" for sample questions');
    console.log('💡 Type "exit" to quit');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }
}

// Main execution
async function main() {
  const cli = new TravelChatbotCLI();
  await cli.start();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the application
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
