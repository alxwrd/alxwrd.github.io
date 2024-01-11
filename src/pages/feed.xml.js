
import rss from '@astrojs/rss';

import { getRssItems } from '../posts';

export async function GET(context) {
    return rss({
        title: "Alex Ward's Blog",
        description: "",
        site: context.site,
        items: await getRssItems(),
        customData: `<language>en-gb</language>`,
    });
}
