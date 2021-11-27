import sanitizeHtml from 'sanitize-html';

const defaultOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a'],
  allowedAttributes: {
    a: ['href'],
  },
} as sanitizeHtml.IOptions;

const sanitize = (dirty: string, options?: sanitizeHtml.IOptions) => ({
  __html: sanitizeHtml(dirty, {
    ...defaultOptions,
    ...options,
  }),
});

const SanitizeHTML = ({
  html,
  options,
}: {
  html: string;
  options?: sanitizeHtml.IOptions;
}) => <div dangerouslySetInnerHTML={sanitize(html, options)} />;

export default SanitizeHTML;
