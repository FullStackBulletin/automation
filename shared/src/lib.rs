use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub struct Issue {
    pub number: u32,
}

#[derive(Deserialize, Debug, Clone)]
pub struct Event {
    #[serde(rename = "NextIssue")]
    pub next_issue: Issue,
}
