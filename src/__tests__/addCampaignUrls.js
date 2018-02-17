import { addCampaignUrls } from '../addCampaignUrls';

test('It should add campaign urls to an array of urls', (endTest) => {
  const urls = [
    { url: 'http://campus.codeschool.com/courses/try-elixir/level/2/section/1/the-pipe-operator?id=222&cid=abc' },
    { url: 'http://example.com' },
  ];

  const expectedUrls = [
    {
      url: 'http://campus.codeschool.com/courses/try-elixir/level/2/section/1/the-pipe-operator?id=222&cid=abc',
      campaignUrls: {
        title: 'http://campus.codeschool.com/courses/try-elixir/level/2/section/1/the-pipe-operator?id=222&cid=abc&utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=some_campaign&utm_content=title',
        image: 'http://campus.codeschool.com/courses/try-elixir/level/2/section/1/the-pipe-operator?id=222&cid=abc&utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=some_campaign&utm_content=image',
        description: 'http://campus.codeschool.com/courses/try-elixir/level/2/section/1/the-pipe-operator?id=222&cid=abc&utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=some_campaign&utm_content=description',
      },
    },
    {
      url: 'http://example.com',
      campaignUrls: {
        title: 'http://example.com/?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=some_campaign&utm_content=title',
        image: 'http://example.com/?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=some_campaign&utm_content=image',
        description: 'http://example.com/?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=some_campaign&utm_content=description',
      },
    },
  ];

  const ulsWithCampaignUrls = addCampaignUrls('some_campaign')(urls);

  expect(ulsWithCampaignUrls).toEqual(expectedUrls);
  endTest();
});
