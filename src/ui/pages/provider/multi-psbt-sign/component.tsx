import { useCallback, useEffect, useState } from "react";

import { IField } from "@/shared/interfaces/provider";
import Modal from "@/ui/components/modal";
import SignPsbtFileds from "@/ui/components/sign-psbt-fileds";
import { useDecodePsbtInputs as useGetPsbtFields } from "@/ui/hooks/provider";
import { useControllersState } from "@/ui/states/controllerState";
import { ss } from "@/ui/utils";
import { KeyIcon } from "@heroicons/react/24/outline";
import { t } from "i18next";
import { TailSpin } from "react-loading-icons";
import Layout from "../layout";

const MultiPsbtSign = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [fields, setFields] = useState<IField[][]>([]);
  const [fee, setFee] = useState<string>("");
  const [modalInputIndex, setModalInputIndex] = useState<number | undefined>(
    undefined
  );

  const { notificationController } = useControllersState(
    ss(["notificationController"])
  );
  const getPsbtFields = useGetPsbtFields();

  const updateFields = useCallback(async () => {
    if (fields.length <= 0) setLoading(true);
    const resultFields = await getPsbtFields();
    if (resultFields === undefined) {
      await notificationController.rejectApproval("Invalid psbt(s)");
      return;
    }
    setFields(resultFields.fields);
    setFee(resultFields.fee + " CRC");
    setLoading(false);
  }, [getPsbtFields, fields, notificationController]);

  useEffect(() => {
    if (fields.length) return;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    updateFields();
  }, [updateFields, fields]);

  if (loading) return <TailSpin className="animate-spin" />;

  return (
    <Layout
      documentTitle={t("provider.sign_tx")}
      resolveBtnClassName="bg-text text-bg hover:bg-green-500 hover:text-bg"
      resolveBtnText={t("provider.sign")}
    >
      <div className="flex flex-col overflow-y-scroll max-h-[420px] standard:max-h-full standard:overflow-hidden items-center gap-3 p-3 text-sm">
        <div className="flex items-center justify-center gap-3 mb-3">
          <KeyIcon className="w-8 h-8 text-green-500" />
          <h4 className="text-xl font-medium">
            {t("provider.multi_psbt_sign")}
          </h4>
        </div>
        {fields.map((fieldsArr, i) => (
          <div key={i} className="w-full flex flex-col items-center">
            <span className="text-light-green">{`- Transaction ${
              i + 1
            } -`}</span>
            <SignPsbtFileds
              fields={fieldsArr}
              setModalInputIndexHandler={setModalInputIndex}
            />
          </div>
        ))}
        <div className="w-full">
          <label className="mb-2 flex text-gray-300 pl-2 justify-between">
            {t("provider.fee") + ":"}
          </label>
          <div className="rounded-xl px-5 py-2 break-all w-full flex gap-1 bg-input-bg">
            <p className="text-light-green">{fee}</p>
          </div>
        </div>
      </div>
      <Modal
        open={modalInputIndex !== undefined}
        onClose={() => {
          setModalInputIndex(undefined);
        }}
        title={t("provider.warning")}
      >
        <div className="text-lg font-medium p-6">
          {t("provider.anyone_can_pay_warning")}
        </div>
      </Modal>
    </Layout>
  );
};

export default MultiPsbtSign;
