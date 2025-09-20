"use client"

import { Shield, Eye, Brain, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

export function LearnSection() {
  const [openSections, setOpenSections] = useState<string[]>(["what-are-deepfakes"])

  const toggleSection = (section: string) => {
    setOpenSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Understanding Deepfakes
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn about deepfake technology, how to identify them, and protect yourself from misinformation.
        </p>
      </div>

      <div className="grid gap-6">
        {/* What are Deepfakes */}
        <Collapsible
          open={openSections.includes("what-are-deepfakes")}
          onOpenChange={() => toggleSection("what-are-deepfakes")}
        >
          <Card className="glass-card overflow-hidden">
            <CollapsibleTrigger className="w-full p-6 text-left hover:bg-muted/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">What are Deepfakes?</h3>
                </div>
                <Badge className="bg-primary">Essential</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Deepfakes are synthetic media created using artificial intelligence, specifically deep learning
                  techniques. They can replace a person's likeness with someone else's in videos, images, or audio
                  recordings with increasingly convincing results.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <CheckCircle className="w-4 h-4 text-primary mr-2" />
                      Legitimate Uses
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      <li>• Film and entertainment industry</li>
                      <li>• Educational content creation</li>
                      <li>• Art and creative expression</li>
                      <li>• Historical recreation</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <AlertTriangle className="w-4 h-4 text-destructive mr-2" />
                      Potential Risks
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      <li>• Misinformation and fake news</li>
                      <li>• Identity theft and fraud</li>
                      <li>• Non-consensual content</li>
                      <li>• Political manipulation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* How to Spot Deepfakes */}
        <Collapsible
          open={openSections.includes("spot-deepfakes")}
          onOpenChange={() => toggleSection("spot-deepfakes")}
        >
          <Card className="glass-card overflow-hidden">
            <CollapsibleTrigger className="w-full p-6 text-left hover:bg-muted/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">How to Spot Deepfakes</h3>
                </div>
                <Badge variant="outline">Detection Tips</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  While deepfakes are becoming more sophisticated, there are still telltale signs that can help you
                  identify synthetic content. Here are key indicators to watch for:
                </p>
                <div className="grid gap-4">
                  <div className="glass-card p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Visual Inconsistencies</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Unnatural eye movements or blinking patterns</li>
                      <li>• Inconsistent lighting or shadows on the face</li>
                      <li>• Blurry or pixelated areas around facial features</li>
                      <li>• Mismatched skin tones or textures</li>
                    </ul>
                  </div>
                  <div className="glass-card p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Audio-Visual Sync Issues</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Lip movements not matching speech</li>
                      <li>• Inconsistent voice quality or tone</li>
                      <li>• Unnatural facial expressions</li>
                      <li>• Jerky or robotic movements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Protection Tips */}
        <Collapsible
          open={openSections.includes("protection-tips")}
          onOpenChange={() => toggleSection("protection-tips")}
        >
          <Card className="glass-card overflow-hidden">
            <CollapsibleTrigger className="w-full p-6 text-left hover:bg-muted/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">Protection & Best Practices</h3>
                </div>
                <Badge variant="outline">Security</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Protect yourself and others from deepfake-related threats by following these best practices:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">For Individuals</h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Verify sources before sharing content</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Use reverse image search tools</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Be skeptical of sensational content</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Check multiple news sources</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">For Organizations</h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Implement detection tools</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Train staff on identification</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Establish verification protocols</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Regular security audits</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Technology Behind Detection */}
        <Collapsible
          open={openSections.includes("detection-tech")}
          onOpenChange={() => toggleSection("detection-tech")}
        >
          <Card className="glass-card overflow-hidden">
            <CollapsibleTrigger className="w-full p-6 text-left hover:bg-muted/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Info className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">Detection Technology</h3>
                </div>
                <Badge variant="outline">Technical</Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Our AI detection system uses advanced machine learning algorithms to analyze images for signs of
                  manipulation:
                </p>
                <div className="grid gap-4">
                  <div className="glass-card p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Neural Network Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Deep learning models trained on millions of authentic and synthetic images to identify subtle
                      patterns and artifacts that indicate manipulation.
                    </p>
                  </div>
                  <div className="glass-card p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Pixel-Level Examination</h4>
                    <p className="text-sm text-muted-foreground">
                      Advanced algorithms examine compression artifacts, noise patterns, and pixel inconsistencies that
                      are often present in deepfake content.
                    </p>
                  </div>
                  <div className="glass-card p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Continuous Learning</h4>
                    <p className="text-sm text-muted-foreground">
                      Our models are continuously updated with new training data to stay ahead of evolving deepfake
                      generation techniques and maintain high accuracy.
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  )
}
