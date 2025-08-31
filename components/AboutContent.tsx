import React from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { CodeBracketIcon, HeartIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const AboutContent: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="bg-gray-900/40 p-4 rounded-lg text-center space-y-4">
            <h3 className="text-xl font-bold text-cyan-400 narrative-text">{t('About the Project')}</h3>
            <div className="text-gray-300 space-y-2">
                <p>{t('Author')}: <span className="font-semibold text-white">Lottarend</span></p>
                <p>{t('Version')}: <span className="font-semibold text-white">0.8</span></p>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
                <p>{t('about_message_p1')}</p>
                <p>{t('about_message_p2')}</p>
            </div>
            <div className="space-y-4 pt-2">
                <a
                    href="https://github.com/StanislavSmetaninSSM/The-Book-of-Eternity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-gray-200 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
                >
                    <CodeBracketIcon className="w-5 h-5" />
                    {t('GitHub Repository')}
                </a>
                 <div className="space-y-1">
                    <a
                        href="https://discord.gg/kDnTx2HAvT"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-gray-200 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
                    >
                        <UserGroupIcon className="w-5 h-5" />
                        {t('Discord Server')}
                    </a>
                    <p className="text-xs text-gray-500">{t('lottarend_discord_description')}</p>
                </div>
                <div className="space-y-1">
                    <a
                        href="https://discord.com/invite/tQTU3jZjAa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-gray-200 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
                    >
                        <UserGroupIcon className="w-5 h-5" />
                        {t('muffin_discord_server')}
                    </a>
                    <p className="text-xs text-gray-500">{t('muffin_discord_description')}</p>
                </div>
                <div
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 text-base font-semibold text-gray-500 bg-gray-800/40 rounded-lg border border-gray-700/60"
                >
                    {t('donations_unavailable')}
                </div>
            </div>
        </div>
    );
};

export default AboutContent;