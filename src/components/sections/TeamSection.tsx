import { prisma } from '@/lib/prisma';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface SocialLinks {
  youtube?: string;
  facebook?: string;
  discord?: string;
  twitter?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string | null;
  socialLinks: string | null;
}

export async function TeamSection() {
  let members: TeamMember[] = [];
  
  try {
    members = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  } catch {
    return null;
  }

  if (members.length === 0) return null;

  return (
    <section className="py-16 relative">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500/10 border border-primary-500/20">
            <UserGroupIcon className="w-5 h-5 text-primary-400" />
            <span className="text-primary-400 font-medium text-lg">ทีมงานของเรา</span>
          </div>
          <h2 className="text-3xl font-bold">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Teams</span>
          </h2>
        </div>

        {/* Team Grid - Centered flex layout */}
        <div className="flex flex-wrap justify-center gap-12">
          {members.map((member) => {
            let socialLinks: SocialLinks = {};
            try {
              socialLinks = JSON.parse(member.socialLinks || '{}');
            } catch {}

            return (
              <div
                key={member.id}
                className="text-center group"
              >
                {/* Avatar */}
                <div className="relative mb-5 mx-auto w-28 h-28">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
                  <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-br from-white/20 to-white/5 group-hover:from-primary-500 group-hover:to-accent-500 transition-all">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl font-bold text-white">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary-400 transition-colors">{member.name}</h3>
                <p className="text-sm text-gray-400 uppercase tracking-wider">{member.role}</p>

                {/* Social Links */}
                <div className="flex justify-center gap-3 mt-4">
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
