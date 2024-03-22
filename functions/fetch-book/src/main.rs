use lambda_runtime::{run, service_fn, Error, tracing, LambdaEvent};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, time::Duration};

#[derive(Deserialize, Debug, Clone)]
struct Issue {
    number: u32,
}

#[derive(Deserialize, Debug, Clone)]
struct Event {
    #[serde(rename = "NextIssue")]
    next_issue: Issue,
}

#[derive(Deserialize, Debug, Clone)]
struct BookAuthor {
    name: String,
}

#[derive(Deserialize, Debug, Clone)]
struct Book {
    slug: String,
    title: String,
    subtitle: Option<String>,
    authors: Vec<BookAuthor>,
    cover: String,
    links: HashMap<String, String>,
    #[serde(rename = "descriptionHtml")]
    description_html: String,
}

#[derive(Serialize, Debug, Clone)]
struct BookResponse {
    id: String,
    title: String,
    author: String,
    // usa, uk, free
    links: HashMap<String, String>,
    #[serde(rename = "coverPicture")]
    cover_picture: String,
    description: String,
}

impl From<Book> for BookResponse {
    fn from(book: Book) -> Self {
        let authors = match book.authors.len() {
            0 => "Unknown".to_string(),
            1 => book.authors.first().unwrap().name.clone(),
            _ => {
                let author_names = book
                    .authors
                    .iter()
                    .cloned()
                    .map(|a| a.name.clone())
                    .collect::<Vec<_>>();
                format!(
                    "{}, and {}",
                    author_names[..author_names.len() - 1].join(", "),
                    author_names.last().unwrap()
                )
            }
        };

        let mut links = HashMap::new();
        for (key, value) in book.links.iter() {
            match key.as_str() {
                "amazon_us" => links.insert("us".to_string(), value.clone()),
                "amazon_uk" => links.insert("uk".to_string(), value.clone()),
                x => links.insert(x.to_string(), value.clone()),
            };
        }

        let title = match book.subtitle {
            Some(subtitle) => format!("{}: {}", book.title, subtitle),
            None => book.title.clone(),
        };

        BookResponse {
            id: book.slug,
            title,
            author: authors,
            links,
            cover_picture: book.cover.clone(),
            description: book.description_html.clone(),
        }
    }
}

static BASE_URL: &str = "https://fullStackbulletin.github.io/fullstack-books";

async fn function_handler(
    client: &Client,
    event: LambdaEvent<Event>,
) -> Result<BookResponse, Error> {
    // Get the list of available book ids
    let book_ids: Vec<String> = client
        .get(format!("{}/books/ids.json", BASE_URL))
        .send()
        .await?
        .json()
        .await?;

    // Select a book by the current issue ID
    let selected_book_id = &book_ids[event.payload.next_issue.number as usize % book_ids.len()];

    // Fetch the book details
    let book_response: Book = client
        .get(format!("{}/books/{}.json", BASE_URL, selected_book_id))
        .send()
        .await?
        .json()
        .await?;

    Ok(book_response.into())
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    let client = &Client::builder().timeout(Duration::from_secs(10)).build()?;

    run(service_fn(move |event| async move {
        function_handler(client, event).await
    }))
    .await
}
