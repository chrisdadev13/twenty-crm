import React from "react";
import { List, Icon, ActionPanel, Action, Toast, showToast } from "@raycast/api";
import { useGetOpportunities } from "./hooks/use-opportunity";
import CreateOpportunityForm from "./create-opportunity";
import CreatePersonForm from "./create-person";
import CreateCompanyForm from "./create-company";

export default function ListOpportunities() {
  const { opportunities, isLoading, error } = useGetOpportunities();

  console.dir(opportunities, { depth: null });

  React.useEffect(() => {
    if (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to load opportunities",
        message: error.message,
      });
    }
  }, [error]);

  const formatCurrency = (amount: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 0,
      }).format(amount / 1000000);
    } catch (error) {
      console.warn(`Invalid currency code: ${currencyCode}. Falling back to simple format.`);
      return `${currencyCode} ${(amount / 1000000).toFixed(0)}`;
    }
  };

  return (
    <List isLoading={isLoading} isShowingDetail>
      {opportunities.map((opportunity) => {
        const formattedAmount = formatCurrency(opportunity.amount.amountMicros, opportunity.amount.currencyCode);

        return (
          <List.Item
            key={opportunity.id}
            id={opportunity.id}
            title={opportunity.name}
            subtitle={opportunity.stage}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  title="Copy Opportunity Name"
                  content={opportunity.name}
                  shortcut={{ modifiers: ["cmd"], key: "c" }}
                />
                <Action.Push
                  icon={Icon.PlusCircle}
                  title="Add Opportunity"
                  shortcut={{ modifiers: ["cmd"], key: "o" }}
                  target={<CreateOpportunityForm />}
                />
                <Action.Push
                  icon={Icon.AddPerson}
                  title="Add People"
                  shortcut={{ modifiers: ["cmd", "ctrl"], key: "p" }}
                  target={<CreatePersonForm />}
                />
                <Action.Push
                  icon={Icon.Building}
                  title="Add Company"
                  shortcut={{ modifiers: ["cmd"], key: "b" }}
                  target={<CreateCompanyForm />}
                />
              </ActionPanel>
            }
            detail={
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Name" text={opportunity.name} />
                    <List.Item.Detail.Metadata.Label title="Stage" text={opportunity.stage} />
                    <List.Item.Detail.Metadata.Label title="Amount" text={formattedAmount} />
                    <List.Item.Detail.Metadata.Label
                      title="Close Date"
                      text={new Date(opportunity.closeDate).toLocaleDateString("en-EN")}
                    />
                    <List.Item.Detail.Metadata.Separator />

                    <List.Item.Detail.Metadata.Label title="Company" text={opportunity.company?.name || "N/A"} />
                    <List.Item.Detail.Metadata.Label
                      title="Point of Contact"
                      text={
                        opportunity.pointOfContact?.name
                          ? `${opportunity.pointOfContact.name.firstName || ""} ${opportunity.pointOfContact.name.lastName || ""}`.trim() ||
                            "N/A"
                          : "N/A"
                      }
                    />
                  </List.Item.Detail.Metadata>
                }
              />
            }
          />
        );
      })}
    </List>
  );
}
