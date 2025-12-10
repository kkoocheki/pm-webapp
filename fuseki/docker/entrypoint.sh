#!/bin/sh
## Licensed under the terms of http://www.apache.org/licenses/LICENSE-2.0

# Start Fuseki in the background
"${FUSEKI_DIR}/fuseki-server" "$@" &
FUSEKI_PID=$!

# Wait for Fuseki to be ready
echo "Waiting for Fuseki to start..."
sleep 5

# Check if database is empty and load example data if needed
TRIPLE_COUNT=$(curl -s -X POST http://localhost:3030/pm/sparql \
  -H "Content-Type: application/sparql-query" \
  -H "Accept: application/sparql-results+json" \
  -d "SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }" | \
  grep -o '"value":"[0-9]*"' | grep -o '[0-9]*' || echo "0")

if [ "$TRIPLE_COUNT" = "0" ]; then
  echo "Database is empty. Loading example data..."

  # Load example project data
  if [ -f "/fuseki/example/example_project_scrum_aligned.ttl" ]; then
    curl -X POST http://localhost:3030/pm/data \
      -H "Content-Type: text/turtle" \
      --data-binary "@/fuseki/example/example_project_scrum_aligned.ttl"
    echo "Example data loaded successfully!"
  else
    echo "Warning: Example data file not found at /fuseki/example/example_project_scrum_aligned.ttl"
  fi
else
  echo "Database already contains $TRIPLE_COUNT triples. Skipping data load."
fi

# Wait for Fuseki process
wait $FUSEKI_PID
