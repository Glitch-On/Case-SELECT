import { executePlayerQuery } from "../services/query.service.js";

export const executeQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { sql } = req.body;

    if (!sql) {
      return res.status(400).json({
        message: "SQL query is required",
      });
    }

    const result = await executePlayerQuery(sql);

    res.status(200).json({
      queryId: id,
      ...result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to execute query",
    });
  }
};