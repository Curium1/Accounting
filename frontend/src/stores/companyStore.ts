import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Define the Company interface
export interface Company {
  isEnrolled: boolean;
  GRUNDINFORMATION: {
    IDENTITETSBETECKNING: string; // "556789-1234" (Organization Number)
    NAMNSKYDDSLÖPNUMMER: string;
    ARENDE: {
      datum: string;
      ärendenummer: string;
    };
    ORGANISATIONSNAMN: string; // "Exempelföretaget AB" (Company Name)
    ORGANISATIONSFORM: {
      kod: string;
      text: string; // e.g., "Aktiebolag"
    };
    ORGANISATIONSSTATUSAR: { // Could be an array if multiple statuses are possible
      kod: string;
      text: string; // e.g., "Aktiv" (Company Status)
      datum: string;
    };
  };
  ENSKILDA_INFORMATIONSMÄNGDER: {
    ORGANISATIONSDATUM?: {
      registreringsdatum: string;
      bildatdatum: string;
    };
    HEMVISTKOMMUN?: string; // e.g., "Stockholm"
    LANSKOD?: string;
    AKTIEINFORMATION?: {
      AKTIESLAG?: Array<{
        ANTAL: number;
        SLAG: string;
        ROSTVARDEN_PER_AKTIE: number;
      }>;
      AKTIEKAPITAL?: {
        NOMINELLT_BELOPP: number;
        VALUTA: string;
      };
      // Add other fields if necessary based on full JSON
    };
    FUNKTIONARER?: Array<{
      funktionstyp: string; // e.g., "Styrelseledamot", "Verkställande direktör"
      namn: string;
      personnummer?: string; // Could be optional or not present for all roles
      // other fields relevant to functionaries
    }>;
    FIRMATECKNING?: {
      text: string; // Description of who can sign for the company
      // other related fields
    };
    ARBETANDE_STYRELSEORDFORANDE?: {
      finns: boolean;
      text?: string;
    };
    REVISORER?: Array<{
      namn: string;
      revisorsbolag?: string;
      // other fields
    }>;
    KONCERNMODERBOLAG?: {
      namn: string;
      organisationsnummer: string;
      // other fields
    };
    // Add any other specific information sets as needed from the full JSON
    // For example: SNI_KODER, FORBUD, etc.
  };
}

export const useCompanyStore = defineStore('company', () => {
  // State
  const companies = ref<Company[]>([]);

  // Getters
  const getCompanyById = (orgNumber: string) => {
    return computed(() => companies.value.find(company => company.GRUNDINFORMATION.IDENTITETSBETECKNING === orgNumber));
  };

  const sortedCompanies = computed(() => {
    return [...companies.value].sort((a, b) => {
      // Sort by isEnrolled (true first)
      if (a.isEnrolled && !b.isEnrolled) return -1;
      if (!a.isEnrolled && b.isEnrolled) return 1;
      // Then sort by ORGANISATIONSNAMN alphabetically
      return a.GRUNDINFORMATION.ORGANISATIONSNAMN.localeCompare(b.GRUNDINFORMATION.ORGANISATIONSNAMN);
    });
  });

  // Actions
  const fetchCompanies = () => {
    const dummyCompanies: Company[] = [
      {
        isEnrolled: true,
        GRUNDINFORMATION: {
          IDENTITETSBETECKNING: "556000-0001",
          NAMNSKYDDSLÖPNUMMER: "123",
          ARENDE: { datum: "2023-01-01", ärendenummer: "A001" },
          ORGANISATIONSNAMN: "Tech Innovators AB",
          ORGANISATIONSFORM: { kod: "AB", text: "Aktiebolag" },
          ORGANISATIONSSTATUSAR: { kod: "A", text: "Aktiv", datum: "2023-01-01" },
        },
        ENSKILDA_INFORMATIONSMÄNGDER: {
          ORGANISATIONSDATUM: { registreringsdatum: "2000-01-15", bildatdatum: "2000-01-01" },
          HEMVISTKOMMUN: "Stockholm",
          LANSKOD: "01",
          AKTIEINFORMATION: {
            AKTIEKAPITAL: { NOMINELLT_BELOPP: 50000, VALUTA: "SEK" }
          },
          FUNKTIONARER: [
            { funktionstyp: "Verkställande direktör", namn: "Erik Svensson" },
            { funktionstyp: "Styrelseledamot", namn: "Anna Andersson" }
          ]
        }
      },
      {
        isEnrolled: false,
        GRUNDINFORMATION: {
          IDENTITETSBETECKNING: "556000-0002",
          NAMNSKYDDSLÖPNUMMER: "456",
          ARENDE: { datum: "2022-11-10", ärendenummer: "A002" },
          ORGANISATIONSNAMN: "Green Solutions Group",
          ORGANISATIONSFORM: { kod: "AB", text: "Aktiebolag" },
          ORGANISATIONSSTATUSAR: { kod: "A", text: "Aktiv", datum: "2022-11-10" },
        },
        ENSKILDA_INFORMATIONSMÄNGDER: {
          ORGANISATIONSDATUM: { registreringsdatum: "2010-05-20", bildatdatum: "2010-05-01" },
          HEMVISTKOMMUN: "Göteborg",
          LANSKOD: "14",
        }
      },
      {
        isEnrolled: true,
        GRUNDINFORMATION: {
          IDENTITETSBETECKNING: "556000-0003",
          NAMNSKYDDSLÖPNUMMER: "789",
          ARENDE: { datum: "2021-03-15", ärendenummer: "A003" },
          ORGANISATIONSNAMN: "Alpha Consulting HB",
          ORGANISATIONSFORM: { kod: "HB", text: "Handelsbolag" },
          ORGANISATIONSSTATUSAR: { kod: "A", text: "Aktiv", datum: "2021-03-15" },
        },
        ENSKILDA_INFORMATIONSMÄNGDER: {
          ORGANISATIONSDATUM: { registreringsdatum: "2015-08-01", bildatdatum: "2015-07-15" },
          HEMVISTKOMMUN: "Malmö",
        }
      },
      {
        isEnrolled: false,
        GRUNDINFORMATION: {
          IDENTITETSBETECKNING: "556000-0004",
          NAMNSKYDDSLÖPNUMMER: "101",
          ARENDE: { datum: "2023-05-01", ärendenummer: "A004" },
          ORGANISATIONSNAMN: "Beta Logistics AB",
          ORGANISATIONSFORM: { kod: "AB", text: "Aktiebolag" },
          ORGANISATIONSSTATUSAR: { kod: "I", text: "Inaktiv", datum: "2023-05-01" },
        },
        ENSKILDA_INFORMATIONSMÄNGDER: {
          HEMVISTKOMMUN: "Uppsala",
        }
      }
    ];
    companies.value = dummyCompanies;
  };

  // Initial fetch of companies when store is initialized (optional, can be called from a component)
  // fetchCompanies(); 

  return {
    companies,
    getCompanyById,
    sortedCompanies,
    fetchCompanies,
  };
});
