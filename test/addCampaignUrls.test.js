import { test } from 'babel-tap';
import { addCampaignUrls } from '../src/addCampaignUrls';

test('It should add campaign urls to an array of urls', (t) => {
  const urls = [
    { id: 'http://campus.codeschool.com/courses/try-elixir/level/2/section/1/the-pipe-operator?id=222&cid=abc' },
    { id: 'http://example.com' },
  ];

  const expectedUrls = [
    {
      id: 'http://campus.codeschool.com/courses/try-elixir/level/2/section/1/the-pipe-operator?id=222&cid=abc',
      campaignUrls: {
        title: 'http://campus.codeschool.com/courses/try-elixir/level/2/section/1/the-pipe-operator?id=222&cid=abc&utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=some_campaign&utm_content=title',
        image: 'http://campus.codeschool.com/courses/try-elixir/level/2/section/1/the-pipe-operator?id=222&cid=abc&utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=some_campaign&utm_content=image',
        description: 'http://campus.codeschool.com/courses/try-elixir/level/2/section/1/the-pipe-operator?id=222&cid=abc&utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=some_campaign&utm_content=description',
      },
    },
    {
      id: 'http://example.com',
      campaignUrls: {
        title: 'http://example.com/?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=some_campaign&utm_content=title',
        image: 'http://example.com/?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=some_campaign&utm_content=image',
        description: 'http://example.com/?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=some_campaign&utm_content=description',
      },
    },
  ];

  const ulsWithCampaignUrls = addCampaignUrls('some_campaign')(urls);

  t.deepEquals(ulsWithCampaignUrls, expectedUrls);
  t.end();
});
