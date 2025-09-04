import { SearchParams } from "@/types";
import { siteConfig } from "@config/site";
import p from "@/lib/language/utils/parse";
import q from "@/lib/language/utils/quantity";
import { language } from "@/lib/language/dictionaries";
import { getPage, getPlayer, getStaff } from "@/utils/searchParams";

import { Icons } from "@/components/layout/icons";
import { DefaultPage } from "@/components/layout/default-page";
import { HistoryTable } from "@/components/punishments/history/history-table";
import { PunishmentTypeCard } from "@/components/punishments/punishment-type-card";
import {getPunishmentCount} from "@/lib/punishment/punishment";

export async function generateMetadata() {
  const { dictionary } = await language();
  const { bans, mutes, warns, kicks } = await getPunishmentCount();
  return {
    title: dictionary.pages.home.title,
    openGraph: {
      images: process.env.SITE_URL + siteConfig.logo,
      description: p(siteConfig.openGraph.pages.main.description, {
        bans: bans,
        mutes: mutes,
        warns: warns,
        kicks: kicks,
        total: bans + mutes + warns + kicks
      })
    }
  }
}

export default async function Home(searchParams: SearchParams) {
  const { dictionary } = await language();

  const { bans, mutes, warns, kicks } = await getPunishmentCount();

  const page = getPage(searchParams);
  const player = getPlayer(searchParams);
  const staff = getStaff(searchParams);

  return (
    <DefaultPage
      title={siteConfig.title}
      description={p(dictionary.pages.home.subtitle, {
        bans: bans,
        mutes: mutes,
        warns: warns,
        kicks: kicks,
        total: bans + mutes + warns + kicks
      })}
      className="w-full space-y-6"
    >
      <div className="mx-auto grid gap-4 sm:grid-cols-2 sm:w-[496px] lg:grid-cols-4 lg:w-[1024px]">
        <PunishmentTypeCard
          title={q(dictionary.words.bans, bans)}
          fromGradient="from-red-500/10"
          count={bans}
          href="/bans"
          punishmentIcon={Icons.ban({ color: 'red', className: "size-[8.5rem] opacity-20 absolute top-[-35px] right-[-25px] blur-sm transition duration-700 group-hover:opacity-40 group-hover:scale-[1.15]" })}
        />
        <PunishmentTypeCard
          title={q(dictionary.words.mutes, mutes)}
          fromGradient="from-neutral-500/10"
          count={mutes}
          href="/mutes"
          punishmentIcon={Icons.mute({ color: 'gray', className: "size-[8.5rem] opacity-20 absolute top-[-35px] right-[-25px] blur-sm transition duration-700 group-hover:opacity-40 group-hover:scale-[1.15]" })}
        />
        <PunishmentTypeCard
          title={q(dictionary.words.warns, warns)}
          fromGradient="from-yellow-600/10"
          count={warns}
          href="/warns"
          punishmentIcon={Icons.warn({ className: "size-[8.5rem] opacity-20 absolute top-[-35px] right-[-25px] text-yellow-500 ml-2 blur-sm transition duration-700 group-hover:opacity-40 group-hover:scale-[1.15]" })}
        />
        <PunishmentTypeCard
          title={q(dictionary.words.kicks, kicks)}
          fromGradient="from-sky-600/5"
          count={kicks}
          href="/kicks"
          punishmentIcon={Icons.kick({ className: "size-[8.5rem] opacity-20 absolute top-[-35px] right-[-25px] text-sky-600 ml-2 blur-sm transition duration-700 group-hover:opacity-40 group-hover:scale-110" })}
        />
      </div>
      <div className="mx-auto w-full lg:w-[1024px]">
        <HistoryTable page={page} player={player} staff={staff} />
      </div>
    </DefaultPage>
  );
}