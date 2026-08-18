import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Progress } from "@/components/campaigns/Progress";
import { Tabs } from "@/components/layout/Tabs";
import Milestones from "@/components/campaigns/Milestones";
import DonorsLeaderboard from "@/components/campaigns/DonorsLeaderboard";
import Updates from "@/components/campaigns/Updates";
import ContractInfo from "@/components/campaigns/ContractInfo";
import { ShareButtons } from "@/components/campaigns/ShareButtons";
import { RelatedCampaigns } from "@/components/campaigns/RelatedCampaigns";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const title = `Example Campaign ${id ? `#${id}` : ""} | Lumora`;
  const description =
    "This is a description for an example campaign. We are raising funds for a great cause.";
  const coverImage = "https://via.placeholder.com/1280x720";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: "Example Campaign",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage],
    },
  };
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;

  const campaign = {
    id: id || "example-campaign",
    title: "Example Campaign",
    description:
      "This is a description for an example campaign. We are raising funds for a great cause.",
    coverImage: "https://via.placeholder.com/1280x720",
    raised: 7500,
    goal: 10000,
    category: "education",
    shareCount: 12,
    about:
      "This is the about section of the campaign. It contains detailed information about the project and its goals.",
    milestones: [
      {
        title: "Milestone 1",
        description: "Description for milestone 1",
        targetAmount: 2500,
        status: "Released" as const,
        verificationLink: "https://stellar.expert",
      },
      {
        title: "Milestone 2",
        description: "Description for milestone 2",
        targetAmount: 5000,
        status: "Unlocked" as const,
      },
      {
        title: "Milestone 3",
        description: "Description for milestone 3",
        targetAmount: 7500,
        status: "Locked" as const,
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
    updates: [
      {
        title: "Prototype hardware arrived",
        date: "2024-02-10",
        content:
          "We just received the first batch of prototype hardware from our manufacturer. **Initial testing looks great** — see the photos below.\n\n- Assembly time reduced by 30%\n- Passed initial stress testing\n- Next step: field testing with a small group of donors",
        attachments: [
          { url: "https://via.placeholder.com/200", alt: "Prototype photo 1" },
          { url: "https://via.placeholder.com/200", alt: "Prototype photo 2" },
        ],
      },
      {
        title: "Campaign kickoff",
        date: "2024-01-05",
        content:
          "Thank you all for the incredible support in our first week! We're off to a great start toward our funding goal.",
      },
    ],
    contractInfo: {
      address: "CBQHNAXSI55GX2GN6D67GK7BHVPSLJUGZQEU7WJ5LKR7RVHVFVSD62A",
      network: "Testnet" as const,
      milestones: [
        { title: "Milestone 1", targetAmount: 2500, status: "Released" as const },
        { title: "Milestone 2", targetAmount: 5000, status: "Unlocked" as const },
        { title: "Milestone 3", targetAmount: 7500, status: "Locked" as const },
      ],
      transactions: [
        {
          hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
          type: "Escrow Deposit",
          amount: 2500,
          asset: "USDC",
          timestamp: "2024-01-06",
        },
        {
          hash: "f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5",
          type: "Milestone Release",
          amount: 2500,
          asset: "USDC",
          timestamp: "2024-02-12",
        },
      ],
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
    { label: "Updates", content: <Updates updates={campaign.updates} /> },
    {
      label: "Contract Info",
      content: <ContractInfo contractInfo={campaign.contractInfo} />,
    },
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
            <div className="p-6 border rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Funding Progress</h2>
              <Progress raised={campaign.raised} goal={campaign.goal} />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
              Donate Now
            </button>
            <ShareButtons
              campaignId={campaign.id}
              title={campaign.title}
              initialShareCount={campaign.shareCount}
            />
          </div>
        </div>
      </div>
      <RelatedCampaigns
        campaignId={campaign.id}
        category={campaign.category}
      />
    </Container>
  );
}
