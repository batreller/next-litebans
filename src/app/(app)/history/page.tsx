import { SearchParams } from "@/types";
import p from "@/lib/language/utils/parse";
import { language } from "@/lib/language/dictionaries";
import { getPunishmentCount } from "@/lib/punishment/punishment";
import { getPage, getPlayer, getStaff } from "@/utils/searchParams";

import { DefaultPage } from "@/components/layout/default-page";
import { HistoryTable } from "@/components/punishments/history/history-table";
import { siteConfig } from "@config/site";

export async function generateMetadata() {
  
  const { dictionary } = await language();

  const { bans, mutes, warns, kicks } = await getPunishmentCount();
  
  return {
    title: dictionary.pages.history.title,
    openGraph: {
      images: process.env.SITE_URL + siteConfig.logo,
      description: p(siteConfig.openGraph.pages.history.description, {
        bans: bans,
        mutes: mutes,
        warns: warns,
        kicks: kicks,
        total: bans + mutes + warns + kicks
      })
    }
  }
}

export default async function History(searchParams: SearchParams) {
  const dictionary = (await language()).dictionary.pages.history;
  
  
  const page = getPage(searchParams);
  const player = getPlayer(searchParams);
  const staff = getStaff(searchParams);

  const punishmentCount = await getPunishmentCount(player, staff).then(({ bans, mutes, warns, kicks }) => bans + mutes + warns + kicks);

  return (
    <DefaultPage
      title={dictionary.title}
      description={p(dictionary.subtitle, {
        total: punishmentCount
      })}
      className="w-full lg:w-[1024px]"
    >
      <HistoryTable page={page} player={player} staff={staff} />
    </DefaultPage>
  );
}