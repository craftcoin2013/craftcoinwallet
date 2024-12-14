import { useControllersState } from "@/ui/states/controllerState";
import { useEffect, useState } from "react";

import type { CreateTxProps } from "@/shared/interfaces/notification";
import { ss } from "@/ui/utils";
import { KeyIcon } from "@heroicons/react/24/outline";
import { t } from "i18next";
import Layout from "../layout";

const CreateTx = () => {
  const [psbt, setPsbt] = useState<CreateTxProps>();

  const { notificationController } = useControllersState(
    ss(["notificationController"])
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const approval = await notificationController.getApproval();
      if (!approval) {
        await notificationController.rejectApproval("Invalid params");
        return;
      }
      setPsbt(approval.params?.data[0]);
    })();
  }, [notificationController]);

  if (!psbt) return <></>;

  const fields = [
    {
      label: "Address",
      value: psbt.to,
    },
    {
      label: "Amount",
      value: `${psbt.amount / 10 ** 8} CRC`,
    },
    {
      label: "Fee Rate",
      value: `${psbt.feeRate} sat/Vb`,
    },
  ];

  return (
    <Layout
      documentTitle={t("provider.create_transaction")}
      resolveBtnClassName="bg-text text-bg hover:bg-green-500 hover:text-bg"
      resolveBtnText={t("components.layout.send")}
    >
      <>
        <KeyIcon className="w-10 h-10 text-green-500" />
        <h4 className="text-xl font-medium mb-6">{t("provider.send_crc")}</h4>
        <div className="flex flex-col gap-4 w-full">
          {fields.map((i) => (
            <div key={i.label}>
              <label className="mb-2 block text-gray-300 pl-2">{i.label}</label>
              <div className="bg-input-bg rounded-xl px-5 py-2">{i.value}</div>
            </div>
          ))}
        </div>
      </>
    </Layout>
  );
};

export default CreateTx;
