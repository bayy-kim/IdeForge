// Gemini structured-output schemas (subset of OpenAPI schema, uppercase types).

export const techRecommendationSchema = {
  type: "OBJECT",
  properties: {
    frontend: { type: "STRING" },
    backend: { type: "STRING" },
    database: { type: "STRING" },
    extras: { type: "ARRAY", items: { type: "STRING" } },
    reasoning: { type: "STRING" },
  },
  required: ["frontend", "backend", "database", "reasoning"],
};

export const questionsSchema = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          question: { type: "STRING" },
          type: { type: "STRING", enum: ["text", "choice"] },
          options: { type: "ARRAY", items: { type: "STRING" } },
          allowCustom: { type: "BOOLEAN" },
          required: { type: "BOOLEAN" },
        },
        required: ["id", "question", "type", "required"],
      },
    },
  },
  required: ["questions"],
};

export const structureSchema = {
  type: "OBJECT",
  properties: {
    appName: { type: "STRING" },
    summary: { type: "STRING" },
    features: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          name: { type: "STRING" },
          phase: { type: "INTEGER" },
          subFeatures: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" },
                name: { type: "STRING" },
              },
              required: ["id", "name"],
            },
          },
        },
        required: ["id", "name", "phase", "subFeatures"],
      },
    },
  },
  required: ["appName", "summary", "features"],
};

export const landingOptionsSchema = {
  type: "OBJECT",
  properties: {
    options: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          styleName: { type: "STRING" },
          styleDescription: { type: "STRING" },
          html: { type: "STRING" },
        },
        required: ["id", "styleName", "styleDescription", "html"],
      },
    },
  },
  required: ["options"],
};

export const tasksSchema = {
  type: "OBJECT",
  properties: {
    tasks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          featureId: { type: "STRING" },
          featureName: { type: "STRING" },
          phase: { type: "INTEGER" },
          title: { type: "STRING" },
          description: { type: "STRING" },
        },
        required: ["id", "featureId", "featureName", "phase", "title", "description"],
      },
    },
  },
  required: ["tasks"],
};
