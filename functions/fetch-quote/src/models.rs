use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct Stats {
    pub total: u32,
    pub all: String,
    pub first: String,
    pub last: String,
    #[serde(rename = "urlPrefix")]
    pub url_prefix: String,
}

#[derive(Deserialize)]
pub struct Author {
    pub id: String,
    pub name: String,
    pub description: String,
    pub wiki: Option<String>,
    pub url: String,
}

#[derive(Deserialize)]
pub struct InputQuote {
    pub id: u32,
    pub text: String,
    pub author: Author,
    pub url: String,
}

#[derive(Deserialize)]
pub struct NextIssue {
    pub number: u32,
}

#[derive(Deserialize)]
pub struct Request {
    #[serde(rename = "NextIssue")]
    pub next_issue: NextIssue,
}

#[derive(Deserialize, Serialize)]
pub struct Quote {
    pub id: u32,
    pub text: String,
    pub author: String,
    #[serde(rename = "authorDescription")]
    pub author_description: String,
    #[serde(rename = "authorUrl")]
    pub author_url: Option<String>,
}

impl From<InputQuote> for Quote {
    fn from(input: InputQuote) -> Self {
        Quote {
            id: input.id,
            text: input.text,
            author: input.author.name,
            author_description: input.author.description,
            author_url: input.author.wiki,
        }
    }
}
