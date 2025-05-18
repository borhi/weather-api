const swaggerOptions = {
  swaggerDefinition: {
    swagger: "2.0",
    info: {
      description: "Weather API application that allows users to subscribe to weather updates for their city.",
      version: "1.0.0",
      title: "Weather Forecast API"
    },
    host: `localhost:${process.env.PORT || 3000}`,
    basePath: "/api",
    tags: [
      {
        name: "weather",
        description: "Weather forecast operations"
      },
      {
        name: "subscription",
        description: "Subscription management operations"
      }
    ],
    schemes: ["http"],
    definitions: {
      Weather: {
        type: "object",
        properties: {
          temperature: {
            type: "number",
            description: "Current temperature"
          },
          humidity: {
            type: "number",
            description: "Current humidity percentage"
          },
          description: {
            type: "string",
            description: "Weather description"
          }
        }
      },
      Subscription: {
        type: "object",
        required: ["email", "city", "frequency"],
        properties: {
          email: {
            type: "string",
            description: "Email address"
          },
          city: {
            type: "string",
            description: "City for weather updates"
          },
          frequency: {
            type: "string",
            description: "Frequency of updates",
            enum: ["hourly", "daily"]
          },
          confirmed: {
            type: "boolean",
            description: "Whether the subscription is confirmed"
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

export default swaggerOptions; 