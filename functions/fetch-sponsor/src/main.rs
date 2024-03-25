use lambda_runtime::{run, service_fn, tracing, Error, LambdaEvent};

use serde::{Deserialize, Serialize};

/// This is a made-up example. Requests come into the runtime as unicode
/// strings in json format, which can map to any structure that implements `serde::Deserialize`
/// The runtime pays no attention to the contents of the request payload.
#[derive(Deserialize)]
struct Request {
    command: String,
}

/// This is a made-up example of what a response structure may look like.
/// There is no restriction on what it can be. The runtime requires responses
/// to be serialized into json. The runtime pays no attention
/// to the contents of the response payload.
#[derive(Serialize)]
struct Response {
    req_id: String,
    msg: String,
}

/// This is the main body for the function.
/// Write your code inside it.
/// There are some code example in the following URLs:
/// - https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/examples
/// - https://github.com/aws-samples/serverless-rust-demo/
async fn function_handler(event: LambdaEvent<Request>) -> Result<Response, Error> {
    // TODO:
    /*

    - get info from the following request:

        curl "https://api.airtable.com/v0/appvAXmhtkJEt9OUH/Sponsors?maxRecords=1&filterByFormula={Issue}=367" \
        -H "Authorization: Bearer $APIKEY" | jq .

      where appvAXmhtkJEt9OUH should be loaded from env vars (injected from SSM: /FullstackBulletin/prod/AirtableSponsorsTableId)
      and, similarly, $APIKEY from SSM: /FullstackBulletin/prod/AirtableApiKey

      The response will look like:

        {
            "records": [
                {
                    "id": "recTizI4GOxsw41Jl",
                    "createdTime": "2024-03-25T09:52:47.000Z",
                    "fields": {
                        "Issue": 367,
                        "Date": "2024-04-08",
                        "BannerHTML": "...",
                        "SponsoredArticleHTML": "...",
                        "Customer": "PostHog"
                    }
                }
            ]
        }
    */

    // Extract some useful info from the request
    let command = event.payload.command;

    // Prepare the response
    let resp = Response {
        req_id: event.context.request_id,
        msg: format!("Command {}.", command),
    };

    // Return `Response` (it will be serialized to JSON automatically by the runtime)
    Ok(resp)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    run(service_fn(function_handler)).await
}
