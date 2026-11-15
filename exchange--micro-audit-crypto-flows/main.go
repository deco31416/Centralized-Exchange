package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

// Config holds the application configuration
type Config struct {
	MongoURI string
	LogLevel string
}

func main() {
	// 1. Initialize Logger
	logger, _ := zap.NewProduction()
	defer logger.Sync()
	sugar := logger.Sugar()

	sugar.Info("🚀 Starting Audit Crypto Flows Service...")

	// 2. Load Config
	if err := godotenv.Load(); err != nil {
		sugar.Warn("No .env file found, using defaults")
	}

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	// 3. Connect to MongoDB (Ledger Source)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		sugar.Fatalw("Failed to connect to MongoDB", "error", err)
	}

	// Verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		sugar.Fatalw("Failed to ping MongoDB", "error", err)
	}

	sugar.Infow("✅ Connected to MongoDB", "uri", mongoURI)

	// 4. Start Watcher Loop (Placeholder)
	sugar.Info("👀 Watching for crypto flows discrepancies...")
	
	// Keep alive
	select {}
}
