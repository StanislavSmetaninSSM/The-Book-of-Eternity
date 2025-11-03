import React from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { CodeBracketIcon, HeartIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';

const AboutContent: React.FC = () => {
    const { t } = useLocalization();

    const LinkCard: React.FC<{ href: string, icon: React.ElementType, title: string, description: string }> = ({ href, icon: Icon, title, description }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-4 text-center bg-gray-800/50 rounded-lg hover:bg-gray-700/70 transition-colors border border-gray-700 hover:border-cyan-500"
        >
            <Icon className="w-8 h-8 mb-2 text-cyan-400" />
            <p className="font-semibold text-gray-200">{title}</p>
            <p className="text-xs text-gray-400 mt-1">{description}</p>
        </a>
    );


    return (
        <div className="bg-gray-900/40 p-4 rounded-lg text-center space-y-4">
            <h3 className="text-xl font-bold text-cyan-400 narrative-text">{t('About the Project')}</h3>
            <div className="text-gray-300 space-y-2">
                <p>{t('Author')}: <span className="font-semibold text-white">Lottarend</span></p>
                <p>{t('Version')}: <span className="font-semibold text-white">0.9</span></p>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
                <p>{t('about_message_p1')}</p>
                <p>{t('about_message_p2')}</p>
            </div>

            <div className="pt-4 border-t border-gray-700/50 space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-2">
                    <h4 className="font-bold text-amber-300 flex items-center justify-center gap-2 text-lg"><HeartIcon className="w-5 h-5"/> {t('Support the Project')}</h4>
                    <p className="text-sm text-gray-300">{t('support_the_project_description')}</p>
                    <a
                        href="https://boosty.to/lottarend/donate"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 px-6 py-2 text-base font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors shadow-md"
                    >
                        {t('Donate via Boosty')}
                    </a>
                </div>

                <div className="bg-gray-900/40 p-4 rounded-lg text-center space-y-3 border border-purple-700/50">
                    <h4 className="font-bold text-gray-400 flex items-center justify-center gap-2 text-lg">
                        <StarIcon className="w-5 h-5"/> {t('DonatorsHallOfFame')}
                    </h4>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                        <p className="font-semibold text-purple-400">{t('donator_muffin')}</p>
                        <p className="font-semibold" style={{ color: '#Ff00ff' }}>Weweshka</p>
                        <p className="font-semibold" style={{ color: '#208020' }}>Xenomorf</p>
                    </div>
                    <p className="text-xs text-gray-400 italic pt-2">{t('donators_motivation')}</p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-cyan-300 mb-3">{t('Community & Resources')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <LinkCard 
                            href="https://github.com/StanislavSmetaninSSM/The-Book-of-Eternity"
                            icon={CodeBracketIcon}
                            title={t('GitHub Repository')}
                            description={t('github_description')}
                        />
                         <LinkCard 
                            href="https://discord.gg/kDnTx2HAvT"
                            icon={UserGroupIcon}
                            title={t('Discord Server')}
                            description={t('lottarend_discord_description')}
                        />
                         <LinkCard 
                            href="https://discord.com/invite/tQTU3jZjAa"
                            icon={UserGroupIcon}
                            title={t('muffin_discord_server')}
                            description={t('muffin_discord_description')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutContent;