

async function fetchData(jwt, query) {
  try {
    const response = await fetch(`https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (error) {
    console.error("GraphQL request failed:", error.message);
    throw error;
  }
}

export { fetchData };
