import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import axios from "axios";
import { useState, useEffect } from "react";
import { useAuthHeaders } from "./hooks/use-auth-headers";
import { useGetCompanies } from "./hooks/use-company";
import { useGetPeople } from "./hooks/use-people";
import ListOpportunities from "./list-opportunities";
import { Opportunity } from "./types";

interface CreateOpportunityFormProps {
  name: string;
  amountMicros?: string;
  currencyCode?: string;
  closeDate?: Date;
  stage?: string;
  position?: string;
  pointOfContactId?: string;
  companyId?: string;
}

export default function CreateOpportunityForm() {
  const { push } = useNavigation();
  const [creationIsLoading, setCreationIsLoading] = useState(false);
  const { companies } = useGetCompanies();
  const { people } = useGetPeople();
  const [filteredPeople, setFilteredPeople] = useState(people);

  const { handleSubmit, itemProps, values } = useForm<CreateOpportunityFormProps>({
    async onSubmit(values) {
      if (!creationIsLoading) {
        setCreationIsLoading(true);

        const newOpportunity = await createOpportunity(values);

        if ("error" in newOpportunity) {
          setCreationIsLoading(false);
          await showToast({
            style: Toast.Style.Failure,
            title: "Failed to Create Opportunity",
            message: newOpportunity.error.message,
          });
          return;
        }

        setCreationIsLoading(false);
        push(<ListOpportunities />);
      }
    },

    validation: {
      name: FormValidation.Required,
      companyId: FormValidation.Required,
    },
  });

  useEffect(() => {
    if (values.companyId && values.companyId !== "") {
      setFilteredPeople(people.filter((p) => p.company?.id === values.companyId));
    } else {
      setFilteredPeople(people);
    }
  }, [values.companyId, people]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
      isLoading={creationIsLoading}
    >
      <Form.Description text="This form is to add an opportunity in your Twenty CRM" />
      <Form.TextField title="Opportunity Name" placeholder="Enter opportunity name" {...itemProps.name} />
      <Form.TextField title="Amount" placeholder="Enter amount in micros" {...itemProps.amountMicros} />
      <Form.TextField title="Currency Code" placeholder="Enter currency code (e.g. USD)" {...itemProps.currencyCode} />
      <Form.TextField title="Stage" placeholder="Enter opportunity stage" {...itemProps.stage} />
      <Form.TextField title="Position" placeholder="Enter position" {...itemProps.position} />
      <Form.Dropdown title="Company" {...itemProps.companyId}>
        <Form.Dropdown.Item value="" title="None" />
        {companies.map((company) => (
          <Form.Dropdown.Item key={company.id} value={company.id} title={company.name} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown title="Point of Contact" {...itemProps.pointOfContactId}>
        <Form.Dropdown.Item value="" title="None" />
        {filteredPeople.map((person) => (
          <Form.Dropdown.Item
            key={person.id}
            value={person.id}
            title={`${person.name.firstName} ${person.name.lastName}`}
          />
        ))}
      </Form.Dropdown>
    </Form>
  );
}

const createOpportunity = async (
  values: CreateOpportunityFormProps,
): Promise<Opportunity | { error: { message: string } }> => {
  try {
    console.log("Creating opportunity", values);
    const response = await axios.post<Opportunity>(
      "https://api.twenty.com/rest/opportunities",
      {
        name: values.name,
        amount: {
          amountMicros: values.amountMicros ? parseInt(values.amountMicros) : undefined,
          currencyCode: values.currencyCode || "USD",
        },
        closeDate: values.closeDate?.toISOString(),
        stage: values.stage || "NEW",
        position: values.position ? parseInt(values.position) : 0,
        pointOfContactId: values.pointOfContactId || "",
        companyId: values.companyId || "",
        createdBy: { source: "API" },
      },
      {
        headers: useAuthHeaders(),
      },
    );

    if (response.status === 200 || response.status === 201) {
      showToast({
        style: Toast.Style.Success,
        title: "Opportunity Created",
        message: `${values.name} has been created successfully`,
      });

      return response.data;
    } else {
      return {
        error: {
          message: "An unexpected error occurred",
        },
      };
    }
  } catch (error) {
    console.error("Error creating opportunity:", error);
    showToast({
      style: Toast.Style.Failure,
      title: "Failed to Create Opportunity",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    });

    if (axios.isAxiosError(error)) {
      return {
        error: {
          message: error.response?.data.message ?? "An unexpected error occurred",
        },
      };
    } else {
      return {
        error: {
          message: "An unexpected error occurred",
        },
      };
    }
  }
};
