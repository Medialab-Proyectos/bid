
import { Project } from '@core/models';
import { Card } from '../../features/dashboard/components/project-card/model/card.model';

export class CardBuilder {
  private project: Project;
  private highlight: string;

  public withProjectCollection(newProject: Project): CardBuilder {
    this.project = newProject;
    return this;
  }
  public withHighlight(newHighlight: string): CardBuilder {
    this.highlight = newHighlight;
    return this;
  }
  public build(): Card {
    const card: Card = new Card();
    card.project = this.project;
    card.highlight = this.highlight;
    return card;
  }
}
