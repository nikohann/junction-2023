'use client'
// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { Message } from 'ai'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { IconOpenAI, IconUser } from '@/components/ui/icons'
import { Button, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalProps, useDisclosure } from '@nextui-org/react'
import { useState } from 'react'
import React from 'react'

export interface ChatMessageProps {
    message: Message,
    messageExtra: any
}

export function ChatMessage({ message, messageExtra, ...props }: ChatMessageProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [modal, setModal] = useState({ title: "news title", summary: "empty summary", href: "#", source: "http://" });
    const [scrollBehavior, setScrollBehavior] = React.useState<ModalProps["scrollBehavior"]>("inside");

    function openModal(title: string, summary: string, href: string, source: string) {
        setModal({ title, summary, href, source });
        onOpen();
    }

    return (
        <div
            className='group relative mb-4 flex items-start md:-ml-12'
            {...props}
        >
            <div
                className={cn(
                    'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
                    message.role === 'user'
                        ? 'bg-background'
                        : 'bg-primary text-primary-foreground'
                )}
            >
                {message.role === 'user' ? <IconUser /> : <IconOpenAI />}
            </div>
            <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
                {
                    (() => {
                        const articles = messageExtra?.articles ?? [];

                        // If some of the articles have fetch: false and don't have any error, we are still waiting for them
                        const waitingForArticles = articles.filter((article: any) => !article.fetched && !article.error);
                        if (waitingForArticles.length > 0) {
                            // Print message "Fetching data from domain1, domain2 and domain3..."
                            const domains = waitingForArticles.map((article: any) => extractDomain(article.url));
                            // @ts-ignore
                            const uniqueDomains = [...new Set(domains)];
                            return (
                                <p>
                                    Fetching data from {formatList(uniqueDomains)}...
                                </p>
                            );
                        }

                        // If some of the articles have done: false and don't have any error, we are still waiting for them
                        const processingArticles = articles.filter((article: any) => !article.done && !article.error);
                        if (processingArticles.length > 0) {
                            // Print list of articles that are being processed
                            return <ul>
                                {articles.filter((article: any) => !article.error).map((article: any, index: number) => {
                                    return <li key={article.url}>
                                        <b>
                                            {index + 1}
                                            {". "}
                                        </b>
                                        {
                                            article.done ?
                                                <>Read: {article.title}</>
                                                :
                                                <>Processing data from {extractDomain(article.url)}...</>
                                        }
                                    </li>
                                })}
                            </ul>;
                        }

                        return null;
                    })()
                }
                <MemoizedReactMarkdown
                    className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
                    remarkPlugins={[remarkGfm]}
                    components={{
                        p({ children }) {
                            return <p className="mb-2 last:mb-0">{children}</p>
                        },
                    }}
                >
                    {message.content}
                </MemoizedReactMarkdown>
                {
                    (() => {
                        // If all articles are either done or have error, then print them
                        const articles = messageExtra?.articles ?? [];
                        const articlesDone = articles.filter((article: any) => article.done);

                        // All articles are either done or have error
                        const done = articles.length > 0
                            && articles.every((article: any) => article.done || article.error);

                        if (done) {
                            return (<>
                                <p>Sources:</p>
                                <ul className='flex flex-col space-y-2'>
                                    {articlesDone.map((article: any, index: number) => {
                                        return (
                                            <li key={article.url}>
                                                <Link
                                                    isBlock
                                                    color="foreground"
                                                    onClick={x => openModal(article.title, article.summary, article.url, extractDomain(article.url))}
                                                    className="underline leading-5 cursor-pointer -mx-2">
                                                    {article.title}
                                                </Link>
                                            </li>
                                        )
                                    })
                                    }
                                </ul>
                                <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior={scrollBehavior}>
                                    <ModalContent>
                                        {(onClose) => (
                                            <>
                                                <ModalHeader className="flex flex-col gap-1">{modal.title}</ModalHeader>
                                                <ModalBody>
                                                    {modal.summary}
                                                    <p className='italic'>{modal.source}</p>
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button color="danger" variant='flat' onPress={onClose}>
                                                        Close
                                                    </Button>

                                                    <Button color="primary" onPress={onClose} as={Link} isExternal href={modal.href}>
                                                        Open full
                                                    </Button>
                                                </ModalFooter>
                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                            </>
                            );
                        }

                        return null;
                    })()
                }
            </div>
        </div >
    )
}

// Include subdomain
const extractDomain = (url: string) => {
    const domain = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    const parts = domain.split('.').reverse();
    const tld = parts[0];
    const sld = parts[1];
    const domainName = `${sld}.${tld}`;
    return domainName;
}

// Utility to format a list with the last element separated by "and"
const formatList = (list: string[]) => {
    if (list.length === 0) {
        return "";
    }
    if (list.length === 1) {
        return list[0];
    }
    if (list.length === 2) {
        return list.join(" and ");
    }
    return list.slice(0, list.length - 1).join(", ") + " and " + list[list.length - 1];
}