import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const toolsDefinition = [
  {
    type: "function" as const,
    function: {
      name: "answer_question",
      description:
        "Speak an answer to the admin about inventory, expenses, or general ERP data.",
      parameters: {
        type: "object",
        properties: { reply: { type: "string" } },
        required: ["reply"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_order",
      description: "Update a laundry order status.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "number" },
          status: {
            type: "string",
            enum: [
              "Pickup",
              "Received",
              "In Progress",
              "Finished",
              "Out for Delivery",
              "Rejected",
            ],
          },
          reply: { type: "string" },
        },
        required: ["orderId", "status", "reply"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "navigate",
      description: "Change the UI screen/section.",
      parameters: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: [
              "dashboard",
              "orders",
              "payroll",
              "services",
              "stocks",
              "reports",
            ],
          },
          reply: { type: "string" },
        },
        required: ["section", "reply"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "add_inventory",
      description: "Add a new item to inventory stocks.",
      parameters: {
        type: "object",
        properties: {
          itemName: { type: "string" },
          quantity: { type: "number" },
          unit: { type: "string", enum: ["kg", "Ltr", "ml", "pcs"] },
          price: { type: "number" },
          reply: { type: "string" },
        },
        required: ["itemName", "quantity", "unit", "price", "reply"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "add_expense",
      description: "Log an operational expense.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: [
              "Detergent/Chemicals",
              "Electricity",
              "Equipment Repair",
              "Fuel/Transport",
              "Other",
            ],
          },
          description: { type: "string" },
          amount: { type: "number" },
          reply: { type: "string" },
        },
        required: ["category", "description", "amount", "reply"],
      },
    },
  },
];

function formatToolResponse(name: string, args: any) {
  if (name === "answer_question")
    return NextResponse.json({ action: "SPEAK", message: args.reply });
  if (name === "update_order")
    return NextResponse.json({
      action: "UPDATE_ORDER",
      orderId: args.orderId,
      newStatus: args.status,
      message: args.reply,
    });
  if (name === "navigate")
    return NextResponse.json({
      action: "NAVIGATE",
      section: args.section,
      message: args.reply,
    });
  if (name === "add_inventory")
    return NextResponse.json({
      action: "ADD_INVENTORY",
      item: args,
      message: args.reply,
    });
  if (name === "add_expense")
    return NextResponse.json({
      action: "ADD_EXPENSE",
      expense: args,
      message: args.reply,
    });
  return NextResponse.json({ action: "SPEAK", message: "Command processed." });
}

export async function POST(req: Request) {
  try {
    const { command, inventoryContext, ordersContext, reportsContext } =
      await req.json();

    const fullPrompt = `
Admin Command: "${command}"
Live Inventory: ${JSON.stringify(inventoryContext || [])}
Live Orders: ${JSON.stringify(ordersContext || [])}
Live Expenses: ${JSON.stringify(reportsContext || [])}
`;

    // ========================================================
    // TIER 1: GOOGLE GEMINI (gemini-2.5-flash)
    // ========================================================
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const geminiTools = [
          {
            functionDeclarations: toolsDefinition.map((t) => ({
              name: t.function.name,
              description: t.function.description,
              parameters: t.function.parameters,
            })),
          },
        ];

        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          tools: geminiTools,
          systemInstruction:
            "You are Arya, an administrative ERP assistant. Execute actions using tools.",
        });

        const result = await model.startChat().sendMessage(fullPrompt);
        const functionCalls = result.response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0];
          console.log("⚡ Executed via Tier 1 (Gemini)");
          return formatToolResponse(call.name, call.args);
        }
      } catch (geminiError: any) {
        console.warn(
          "⚠️ Tier 1 (Gemini) quota exceeded/failed. Cascading to OpenRouter...",
        );
      }
    }

    // ========================================================
    // TIER 2: OPENROUTER (Primary Backup - openai/gpt-4o-mini)
    // ========================================================
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const openrouter = new OpenAI({
          apiKey: process.env.OPENROUTER_API_KEY,
          baseURL: "https://openrouter.ai/api/v1",
          defaultHeaders: {
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Laundry ERP",
          },
        });

        const completion = await openrouter.chat.completions.create({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are Arya, an administrative ERP assistant. Execute actions using tools.",
            },
            { role: "user", content: fullPrompt },
          ],
          tools: toolsDefinition,
          tool_choice: "auto",
        });

        const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const args = JSON.parse(toolCall.function.arguments);
          console.log("⚡ Executed via Tier 2 (OpenRouter)");
          return formatToolResponse(toolCall.function.name, args);
        }
      } catch (openRouterError: any) {
        console.warn(
          "⚠️ Tier 2 (OpenRouter) failed. Cascading to NVIDIA NIM...",
        );
      }
    }

    // ========================================================
    // TIER 3: NVIDIA NIM (Secondary Backup)
    // ========================================================
    if (process.env.NVIDIA_API_KEY) {
      try {
        const nvidia = new OpenAI({
          apiKey: process.env.NVIDIA_API_KEY,
          baseURL: "https://integrate.api.nvidia.com/v1",
        });

        const completion = await nvidia.chat.completions.create({
          model: "meta/llama-3.1-70b-instruct", // Updated active NIM endpoint
          messages: [
            {
              role: "system",
              content:
                "You are Arya, an administrative ERP assistant. Execute actions using tools.",
            },
            { role: "user", content: fullPrompt },
          ],
          tools: toolsDefinition,
          tool_choice: "auto",
        });

        const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const args = JSON.parse(toolCall.function.arguments);
          console.log("⚡ Executed via Tier 3 (NVIDIA NIM)");
          return formatToolResponse(toolCall.function.name, args);
        }
      } catch (nvidiaError: any) {
        console.error(
          "🚨 Tier 3 (NVIDIA) failed:",
          nvidiaError.message || nvidiaError,
        );
      }
    }

    return NextResponse.json({
      action: "SPEAK",
      message: "All AI services failed or quotas are exhausted.",
    });
  } catch (error) {
    console.error("🚨 CRITICAL ERROR:", error);
    return NextResponse.json(
      { action: "SPEAK", message: "Server encountered an unexpected error." },
      { status: 500 },
    );
  }
}
