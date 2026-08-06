import { useState } from "react";
import { useLanguage } from "contexts";

const FINANCE_TABS = {
  PLAN: "plan",
  PAYMENTS: "payments",
};

/** Demo rows until shop payment history API is wired. */
const PAYMENT_HISTORY_ROWS = [
  { id: "1", methodId: "card4321", status: "approved" },
  { id: "2", methodId: "idram", status: "rejected" },
  { id: "3", methodId: "visa0102", status: "approved" },
];

const PaymentStatusBadge = ({ status, t }) =>
  status === "approved" ? (
    <span className="inline-flex shrink-0 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#166534]">
      {t("shopAccount.finance.payments.statusApproved")}
    </span>
  ) : (
    <span className="inline-flex shrink-0 rounded-full bg-[#FFE4E6] px-3 py-1 text-xs font-semibold text-[#9F1239]">
      {t("shopAccount.finance.payments.statusRejected")}
    </span>
  );

const ShopFinanceWidget = () => {
  const { t } = useLanguage();
  const [financeTab, setFinanceTab] = useState(FINANCE_TABS.PLAN);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div
        className="flex w-fit max-w-full items-center overflow-x-auto"
        role="tablist"
        aria-label={t("shopAccount.finance.tabsAria")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={financeTab === FINANCE_TABS.PLAN}
          className={`touch-manipulation shrink-0 self-center border-b-2 px-2 pb-2 align-middle text-center font-sans text-[14px] font-normal leading-[100%] tracking-normal text-[rgba(21,33,71,1)] transition-colors duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:px-3 ${
            financeTab === FINANCE_TABS.PLAN ? "border-navy" : "border-[#b8b8b8]"
          }`}
          onClick={() => setFinanceTab(FINANCE_TABS.PLAN)}
        >
          {t("shopAccount.finance.tabs.plan")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={financeTab === FINANCE_TABS.PAYMENTS}
          className={`touch-manipulation shrink-0 self-center border-b-2 px-2 pb-2 align-middle text-center font-sans text-[14px] leading-[100%] tracking-normal text-[rgba(21,33,71,1)] transition-colors duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:px-3 ${
            financeTab === FINANCE_TABS.PAYMENTS ? "border-navy font-medium" : "border-[#b8b8b8] font-normal"
          }`}
          onClick={() => setFinanceTab(FINANCE_TABS.PAYMENTS)}
        >
          {t("shopAccount.finance.tabs.payments")}
        </button>
      </div>

      {financeTab === FINANCE_TABS.PLAN ? (
        <>
          <div
            className="box-border flex h-[220px] w-full max-w-[353px] flex-col gap-5 rounded-[20px] border border-[rgb(221,227,248)] bg-white p-5"
            role="tabpanel"
          >
            <h2 className="m-0 shrink-0 font-sans text-base font-medium leading-6 text-navy">{t("shopAccount.finance.planCardTitle")}</h2>
            <div className="h-px w-full shrink-0 bg-[rgb(221,227,248)]" role="presentation" />
            <dl className="m-0 flex flex-col gap-5 text-start">
              <div className="flex flex-wrap items-baseline gap-x-1">
                <dt className="m-0 font-sans text-[14px] font-normal leading-normal text-navy">{t("shopAccount.finance.planNameLabel")}</dt>
                <dd className="m-0 py-0 px-2 font-sans text-lg font-bold leading-normal text-navy">{t("shopAccount.finance.planName")}</dd>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-1">
                <dt className="m-0 font-sans text-[14px] font-normal leading-normal text-navy">{t("shopAccount.finance.planValueLabel")}</dt>
                <dd className="m-0 py-0 px-2 font-sans text-lg font-bold leading-normal text-navy">{t("shopAccount.finance.planTotal")}</dd>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-1">
                <dt className="m-0 font-sans text-[14px] font-normal leading-normal text-navy">{t("shopAccount.finance.planMonthlyLabel")}</dt>
                <dd className="m-0 py-0 px-2 font-sans text-lg font-bold leading-normal text-navy">{t("shopAccount.finance.planMonthly")}</dd>
              </div>
            </dl>
          </div>
        </>
      ) : (
        <div className="w-full max-w-5xl" role="tabpanel">
          <ul
            className="m-0 flex list-none flex-col gap-3 p-0 md:hidden"
            aria-label={t("shopAccount.finance.payments.tableAria")}
          >
            {PAYMENT_HISTORY_ROWS.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 rounded-[12px] border border-[#E2E8F0] bg-white px-4 py-4 font-sans shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="m-0 min-w-0 flex-1 text-sm font-medium leading-snug text-navy">
                    {t(`shopAccount.finance.payments.rows.${row.methodId}`)}
                  </p>
                  <p className="m-0 shrink-0 text-sm font-bold leading-snug text-navy">
                    {t("shopAccount.finance.payments.sampleAmount")}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs leading-none text-[#64748B]">{t("shopAccount.finance.payments.sampleDate")}</span>
                  <PaymentStatusBadge status={row.status} t={t} />
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table
              className="w-full min-w-[520px] border-collapse font-sans text-sm"
              aria-label={t("shopAccount.finance.payments.tableAria")}
            >
              <thead>
                <tr className="bg-[#F8FAFC] text-navy">
                  <th
                    scope="col"
                    className="rounded-tl-xl border-b border-[#E2E8F0] px-4 py-4 text-left text-sm font-medium sm:px-5 sm:py-5"
                  >
                    {t("shopAccount.finance.payments.colDate")}
                  </th>
                  <th
                    scope="col"
                    className="border-b border-[#E2E8F0] px-4 py-4 text-left text-sm font-medium sm:px-5 sm:py-5"
                  >
                    {t("shopAccount.finance.payments.colMethod")}
                  </th>
                  <th
                    scope="col"
                    className="border-b border-[#E2E8F0] px-4 py-4 text-center text-sm font-medium sm:px-5 sm:py-5"
                  >
                    {t("shopAccount.finance.payments.colStatus")}
                  </th>
                  <th
                    scope="col"
                    className="rounded-tr-xl border-b border-[#E2E8F0] px-4 py-4 text-right text-sm font-medium sm:px-5 sm:py-5"
                  >
                    {t("shopAccount.finance.payments.colAmount")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {PAYMENT_HISTORY_ROWS.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#E2E8F0] transition-colors last:border-b-0 hover:bg-[#F8FAFC]/60"
                  >
                    <td className="px-4 py-4 text-[#64748B] sm:px-5 sm:py-5">{t("shopAccount.finance.payments.sampleDate")}</td>
                    <td className="px-4 py-4 font-bold text-navy sm:px-5 sm:py-5">
                      {t(`shopAccount.finance.payments.rows.${row.methodId}`)}
                    </td>
                    <td className="px-4 py-4 text-center sm:px-5 sm:py-5">
                      <PaymentStatusBadge status={row.status} t={t} />
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-navy sm:px-5 sm:py-5">
                      {t("shopAccount.finance.payments.sampleAmount")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopFinanceWidget;
