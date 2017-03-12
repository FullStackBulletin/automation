import { parse } from 'url';

export const getLinkLabelBasedOnUrl = (url) => {
  const defaultLabel = 'Read article';
  const labels = {
    'github.com': 'View Repository',
    'youtube.com': 'Watch video',
    'vimeo.com': 'Watch video',
  };

  for (let i = 0; i < Object.keys(labels).length; i += 1) {
    const domain = Object.keys(labels)[i];
    if (parse(url).hostname.match(domain)) {
      return labels[domain];
    }
  }

  return defaultLabel;
};

export default { getLinkLabelBasedOnUrl };
