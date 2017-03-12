import { test } from 'babel-tap';
import { getLinkLabelBasedOnUrl } from '../src/getLinkLabelBasedOnUrl';

test('it should return the default label if no domain is matched', (t) => {
  const url = 'https://medium.com/airbnb-engineering/introducing-lottie-4ff4a0afac0e?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-10-2017&utm_content=description';
  t.equals(getLinkLabelBasedOnUrl(url), 'Read article');
  t.end();
});

test('it should return the github label', (t) => {
  const url = 'https://github.com/ryanmcdermott/clean-code-javascript?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-10-2017&utm_content=description';
  t.equals(getLinkLabelBasedOnUrl(url), 'View Repository');
  t.end();
});

test('it should return the youtube label', (t) => {
  const url = 'https://www.youtube.com/watch?v=7ctkTFv6XdA&utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-10-2017&utm_content=description';
  t.equals(getLinkLabelBasedOnUrl(url), 'Watch video');
  t.end();
});

test('it should return the vimeo label', (t) => {
  const url = 'https://vimeo.com/171068992?utm_source=fullstackbulletin.com&utm_medium=newsletter&utm_campaign=fullstackBulletin-10-2017&utm_content=description';
  t.equals(getLinkLabelBasedOnUrl(url), 'Watch video');
  t.end();
});
