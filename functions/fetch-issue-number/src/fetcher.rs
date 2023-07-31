use nom::{
    bytes::complete::{tag, take_until, take_while},
    IResult,
};
use scraper::selector;

fn parse_number_from_title(title: &str) -> IResult<&str, u32> {
    let (input, _) = take_until("#")(title)?;
    let (input, _) = tag("#")(input)?;
    let (input, number) = take_while(|c: char| c.is_ascii_digit())(input)?;

    Ok((input, number.parse().unwrap()))
}

pub async fn fetch_last_issue_number() -> Result<u32, ()> {
    let url = "https://us15.campaign-archive.com/home/?u=b015626aa6028495fe77c75ea&id=55ace33899";
    let resp = reqwest::get(url).await.unwrap();
    let body = resp.text().await.unwrap();
    let document = scraper::Html::parse_document(&body);
    let selector = selector::Selector::parse(".campaign a[title]").unwrap();

    // Title looks like: "🤓 #331: Putting the "You" in CPU"
    let last_link_title = document
        .select(&selector)
        .next()
        .unwrap()
        .value()
        .attr("title")
        .unwrap();

    let (_, issue_number) = parse_number_from_title(last_link_title).unwrap();

    Ok(issue_number)
}
