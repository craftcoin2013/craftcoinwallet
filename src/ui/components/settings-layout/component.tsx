import { CRAFTCOIN_URL } from "@/shared/constant";
import { browserTabsCreate } from "@/shared/utils/browser";
import { FC, ReactNode } from "react";
import config from "../../../../package.json";
import s from "./styles.module.scss";

interface SettingsLayoutProps {
  children: ReactNode;
}

const SettingsLayout: FC<SettingsLayoutProps> = ({ children }) => {
  return (
    <div className={s.wrapper}>
      <div className={s.settings}>{children}</div>
      <div className={s.version}>
        Version <span>{config.version}</span> | By the{" "}
        <a
          href="#"
          onClick={async () => {
            await browserTabsCreate({
              url: CRAFTCOIN_URL,
              active: true,
            });
          }}
        >
          CraftCoin Community
        </a>
        <div>Special thanks to NintondoWallet and LuckycoinWallet ❤️</div>
      </div>
    </div>
  );
};

export default SettingsLayout;
