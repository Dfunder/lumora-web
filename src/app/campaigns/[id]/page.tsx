const import { Container } from "@/components/layout/Container";
import { Progress } from "@/components/campaigns/Progress";
import { Tabs } from "@/components/layout/Tabs";

const CampaignDetailPage = () => {
  const campaign = {
    title: "Example Campaign",
    description: "This is a description for an example campaign. We are raising funds for a great cause.",
    coverImage: "https://via.placeholder.com/1280x720",
    raised: 7500,
    goal: 10000,
    about: "This is the about section of the campaign. It contains detailed information about the project and its goals.",
    milestones: [
      { title: "Milestone 1", description: "Description for milestone 1" },
      { title: "Milestone 2", description: "Description for milestone 2" },
    ],
    donors: [
      { address: "0x123...", amount: 100 },
      { address: "0x456...", amount: 250 },
    ],
    updates: [
      { title: "Update 1", content: "This is the first update." },
    ],
    contractInfo: {
      address: "0xabc...",
      platform: "Ethereum",
    },
  };

  const tabs = [
    { label: "About", content: <div>{campaign.about}</div> },
    { label: "Milestones", content: <div>Milestones content</div> },
    { label: "Donors", content: <div>Donors content</div> },
    { label: "Updates", content: <div>Updates content</div> },
    { label: "Contract Info", content: <div>Contract Info content</div> },
  ];

  return (
    <Container className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="space-y-8">
            <div>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <img
                  src={campaign.coverImage}
                  alt="Campaign cover"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{campaign.title}</h1>
              <p className="mt-2 text-lg text-gray-600">{campaign.description}</p>
            </div>
            <Tabs tabs={tabs} />
          </div>
        </div>
        <div>
          <div className="sticky top-24 space-y-6">
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Funding Progress</h2>
              <Progress raised={campaign.raised} goal={campaign.goal} />
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
              Donate Now
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CampaignDetailPage;