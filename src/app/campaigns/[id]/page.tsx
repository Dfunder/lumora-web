import { Container } from "@/components/layout/Container";
import { Progress } from "@/components/campaigns/Progress";
import { Tabs } from "@/components/layout/Tabs";
import Milestones from "@/components/campaigns/Milestones";
import DonorsLeaderboard from "@/components/campaigns/DonorsLeaderboard";

const CampaignDetailPage = () => {
  const campaign = {
    title: "Example Campaign",
    description:
      "This is a description for an example campaign. We are raising funds for a great cause.",
    coverImage: "https://via.placeholder.com/1280x720",
    raised: 7500,
    goal: 10000,
    about:
      "This is the about section of the campaign. It contains detailed information about the project and its goals.",
    milestones: [
      {
        title: "Milestone 1",
        description: "Description for milestone 1",
        targetAmount: 2500,
        status: "Released",
        verificationLink: "https://stellar.expert",
      },
      {
        title: "Milestone 2",
        description: "Description for milestone 2",
        targetAmount: 5000,
        status: "Unlocked",
      },
      {
        title: "Milestone 3",
        description: "Description for milestone 3",
        targetAmount: 7500,
        status: "Locked",
      },
    ],
    donors: [
      {
        rank: 1,
        wallet: "0x1234567890123456789012345678901234567890",
        amount: 100,
        asset: "USD",
        timestamp: "2024-01-01",
      },
      {
        rank: 2,
        wallet: "0x0987654321098765432109876543210987654321",
        amount: 250,
        asset: "USD",
        timestamp: "2024-01-02",
      },
      // Add more donors for pagination testing
      ...Array.from({ length: 25 }, (_, i) => ({
        rank: i + 3,
        wallet: `0x${(i + 3).toString().padStart(40, "0")}`,
        amount: 10 * (i + 1),
        asset: "USD",
        timestamp: `2024-01-${(i + 3).toString().padStart(2, "0")}`,
      })),
      {
        rank: 28,
        wallet: "Anonymous",
        amount: 50,
        asset: "USD",
        timestamp: "2024-01-28",
      },
    ],
    updates: [{ title: "Update 1", content: "This is the first update." }],
    contractInfo: {
      address: "0xabc...",
      platform: "Ethereum",
    },
  };

  const tabs = [
    { label: "About", content: <div>{campaign.about}</div> },
    {
      label: "Milestones",
      content: <Milestones milestones={campaign.milestones} />,
    },
    {
      label: "Donors",
      content: <DonorsLeaderboard donors={campaign.donors} />,
    },
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
              <p className="mt-2 text-lg text-gray-600">
                {campaign.description}
              </p>
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
